import hashlib
import json
import logging
import math
import re
import threading
import unicodedata
from pathlib import Path
from typing import Any, Optional

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT_KNOWLEDGE_PATH = DATA_DIR / "spiritual_knowledge.json"
DEFAULT_CACHE_PATH = DATA_DIR / "embeddings_cache.json"

_VIETNAMESE_STOPWORDS = frozenset(
    {
        "la", "gi", "nao", "the", "nhu", "cho", "toi", "xin", "hoi", "ve", "cua",
        "va", "cac", "nhung", "co", "duoc", "khong", "khi", "can", "nen", "lam",
        "sao", "o", "dau", "bao", "nhieu", "may", "voi", "trong", "de", "hay",
        "hoac", "bai", "cach", "xem", "biet", "giup", "minh", "ban", "a", "nhe",
        "oi", "vay", "thi", "ma", "nay", "kia", "do", "ta", "chung", "em", "anh",
        "chi", "chu", "bac", "ong", "ba", "hom", "ngay", "thang", "nam",
    }
)


def _strip_accents(text: str) -> str:
    """Loại bỏ dấu tiếng Việt để hỗ trợ so khớp từ khóa không dấu."""
    replaced = text.replace("đ", "d").replace("Đ", "D")
    nfd = unicodedata.normalize("NFD", replaced)
    return "".join(ch for ch in nfd if unicodedata.category(ch) != "Mn")


def _normalize_text(text: str, strip_diacritics: bool = False) -> str:
    """Chuẩn hóa chuỗi về chữ thường, gộp khoảng trắng."""
    lowered = unicodedata.normalize("NFC", text).lower()
    if strip_diacritics:
        lowered = _strip_accents(lowered)
    cleaned = re.sub(r"[^\w\s]", " ", lowered, flags=re.UNICODE)
    return re.sub(r"\s+", " ", cleaned).strip()


def _tokenize(text: str, strip_diacritics: bool = False) -> set[str]:
    """Tách từ từ văn bản đã chuẩn hóa."""
    norm = _normalize_text(text, strip_diacritics=strip_diacritics)
    return {tok for tok in norm.split(" ") if tok}


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Tính Cosine Similarity thuần bằng thư viện chuẩn math."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    score = dot_product / (norm_a * norm_b)
    return max(0.0, min(1.0, score))


class RAGService:
    """
    Lightweight Hybrid RAG Service cho E-Spirit:
    - Đọc kho tri thức từ `app/data/spiritual_knowledge.json`.
    - Lưu cache vector embedding tại `app/data/embeddings_cache.json` theo hash nội dung.
    - Kết hợp điểm Semantic (Cosine Similarity) và Keyword/Tag Matching.
    - Tự động fallback về 100% Keyword Matching nếu thiếu GEMINI_API_KEY hoặc lỗi API.
    """

    def __init__(
        self,
        knowledge_path: Optional[Path] = None,
        cache_path: Optional[Path] = None,
        api_key: Optional[str] = None,
        embedding_model: Optional[str] = None,
    ):
        self.knowledge_path = knowledge_path or DEFAULT_KNOWLEDGE_PATH
        self.cache_path = cache_path or DEFAULT_CACHE_PATH
        self.api_key = (api_key if api_key is not None else settings.GEMINI_API_KEY).strip()
        self.embedding_model = (embedding_model or settings.GEMINI_EMBEDDING_MODEL).strip()
        self._lock = threading.Lock()
        self._client: Optional[genai.Client] = None

        self.documents: list[dict[str, Any]] = self._load_documents()
        self._doc_index: list[dict[str, Any]] = self._build_keyword_index(self.documents)
        self._embeddings: dict[str, list[float]] = self._load_cached_embeddings()

    def _get_client(self) -> Optional[genai.Client]:
        """Khởi tạo lazy genai.Client khi có API Key hợp lệ."""
        if not self.api_key:
            return None
        if self._client is None:
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def _load_documents(self) -> list[dict[str, Any]]:
        """Đọc danh sách mục kiến thức từ file JSON."""
        if not self.knowledge_path.exists():
            logger.warning("Không tìm thấy kho tri thức RAG tại %s", self.knowledge_path)
            return []
        try:
            raw = self.knowledge_path.read_text(encoding="utf-8")
            data = json.loads(raw)
            if not isinstance(data, list):
                logger.warning("Dữ liệu kho tri thức RAG không phải dạng danh sách JSON.")
                return []
            return [item for item in data if isinstance(item, dict) and item.get("id")]
        except Exception as exc:
            logger.warning("Lỗi khi đọc kho tri thức RAG (%s): %s", self.knowledge_path, exc)
            return []

    @staticmethod
    def _doc_embedding_text(doc: dict[str, Any]) -> str:
        """Tạo chuỗi văn bản đại diện cho tài liệu để tạo embedding và hash."""
        title = str(doc.get("title", "")).strip()
        category = str(doc.get("category", "")).strip()
        keywords = ", ".join(str(k) for k in doc.get("keywords", []))
        content = str(doc.get("content", "")).strip()
        return f"title: {title} | category: {category} | keywords: {keywords} | text: {content}"

    @staticmethod
    def _hash_text(text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def _build_keyword_index(self, docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Tiền xử lý từ khóa và token của tài liệu để tăng tốc truy xuất."""
        indexed: list[dict[str, Any]] = []
        for doc in docs:
            title = str(doc.get("title", ""))
            content = str(doc.get("content", ""))
            keywords = [str(k) for k in doc.get("keywords", []) if k]

            kw_entries = []
            for kw in keywords:
                kw_norm = _normalize_text(kw, strip_diacritics=False)
                kw_ascii = _normalize_text(kw, strip_diacritics=True)
                if kw_norm:
                    word_count = len(kw_norm.split(" "))
                    kw_entries.append((kw_norm, kw_ascii, word_count))

            title_kw_text = f"{title} {' '.join(keywords)}"
            indexed.append(
                {
                    "doc": doc,
                    "doc_id": str(doc["id"]),
                    "embed_text": self._doc_embedding_text(doc),
                    "embed_hash": self._hash_text(self._doc_embedding_text(doc)),
                    "kw_entries": kw_entries,
                    "title_kw_tokens": _tokenize(title_kw_text, strip_diacritics=False),
                    "title_kw_tokens_ascii": _tokenize(title_kw_text, strip_diacritics=True),
                    "content_tokens": _tokenize(content, strip_diacritics=False),
                    "content_tokens_ascii": _tokenize(content, strip_diacritics=True),
                }
            )
        return indexed

    def _load_cached_embeddings(self) -> dict[str, list[float]]:
        """Nạp vector cache hợp lệ khớp với model và hash nội dung hiện tại."""
        if not self.cache_path.exists():
            return {}
        try:
            cache_data = json.loads(self.cache_path.read_text(encoding="utf-8"))
            if not isinstance(cache_data, dict):
                return {}
            if cache_data.get("model") != self.embedding_model:
                return {}
            items = cache_data.get("items", {})
            if not isinstance(items, dict):
                return {}

            valid_hashes = {entry["doc_id"]: entry["embed_hash"] for entry in self._doc_index}
            loaded: dict[str, list[float]] = {}
            for doc_id, expected_hash in valid_hashes.items():
                cached_entry = items.get(doc_id)
                if (
                    isinstance(cached_entry, dict)
                    and cached_entry.get("hash") == expected_hash
                    and isinstance(cached_entry.get("embedding"), list)
                    and cached_entry["embedding"]
                ):
                    loaded[doc_id] = [float(v) for v in cached_entry["embedding"]]
            return loaded
        except Exception as exc:
            logger.warning("Không thể đọc cache embedding (%s): %s", self.cache_path, exc)
            return {}

    def _save_cached_embeddings(self) -> None:
        """Ghi cache vector embedding ra file JSON."""
        try:
            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            items_payload = {}
            for entry in self._doc_index:
                doc_id = entry["doc_id"]
                vec = self._embeddings.get(doc_id)
                if vec:
                    items_payload[doc_id] = {
                        "hash": entry["embed_hash"],
                        "embedding": vec,
                    }
            payload = {
                "model": self.embedding_model,
                "items": items_payload,
            }
            tmp_path = self.cache_path.with_suffix(".tmp")
            tmp_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            tmp_path.replace(self.cache_path)
        except Exception as exc:
            logger.warning("Không thể lưu cache embedding (%s): %s", self.cache_path, exc)

    def _ensure_document_embeddings(self) -> bool:
        """Đảm bảo toàn bộ tài liệu đã có vector embedding (chỉ gọi API cho phần chưa cache)."""
        client = self._get_client()
        if client is None or not self._doc_index:
            return False

        missing = [
            entry for entry in self._doc_index if entry["doc_id"] not in self._embeddings
        ]
        if not missing:
            return True

        with self._lock:
            missing = [
                entry for entry in self._doc_index if entry["doc_id"] not in self._embeddings
            ]
            if not missing:
                return True

            try:
                texts = [entry["embed_text"] for entry in missing]
                response = client.models.embed_content(
                    model=self.embedding_model,
                    contents=texts,
                )
                embeddings = getattr(response, "embeddings", None) or []
                if len(embeddings) != len(missing):
                    logger.warning(
                        "Số lượng vector embedding trả về (%d) không khớp số tài liệu (%d).",
                        len(embeddings),
                        len(missing),
                    )
                    return False

                for entry, emb_obj in zip(missing, embeddings):
                    values = getattr(emb_obj, "values", None)
                    if not values:
                        return False
                    self._embeddings[entry["doc_id"]] = [float(v) for v in values]

                self._save_cached_embeddings()
                return True
            except Exception as exc:
                logger.warning(
                    "Lỗi khi tạo embedding tài liệu RAG bằng %s, fallback về keyword search: %s",
                    self.embedding_model,
                    exc,
                )
                return False

    def _embed_query(self, query: str) -> Optional[list[float]]:
        """Tạo vector embedding cho câu truy vấn của người dùng."""
        client = self._get_client()
        if client is None:
            return None
        try:
            response = client.models.embed_content(
                model=self.embedding_model,
                contents=query,
            )
            embeddings = getattr(response, "embeddings", None) or []
            if not embeddings:
                return None
            values = getattr(embeddings[0], "values", None)
            return [float(v) for v in values] if values else None
        except Exception as exc:
            logger.warning(
                "Lỗi khi tạo embedding truy vấn RAG bằng %s, fallback về keyword search: %s",
                self.embedding_model,
                exc,
            )
            return None

    @staticmethod
    def _compute_keyword_score(query: str, entry: dict[str, Any]) -> float:
        """
        Tính điểm khớp Keyword/Tag & Title chuẩn hóa trong khoảng [0.0, 1.0].
        Hỗ trợ cả truy vấn tiếng Việt có dấu và không dấu.
        """
        query_norm = _normalize_text(query, strip_diacritics=False)
        query_ascii = _normalize_text(query, strip_diacritics=True)
        if not query_norm:
            return 0.0

        query_tokens = _tokenize(query, strip_diacritics=False)
        query_tokens_ascii = _tokenize(query, strip_diacritics=True)

        meaningful_tokens = {
            tok for tok in query_tokens if _strip_accents(tok) not in _VIETNAMESE_STOPWORDS
        }
        meaningful_ascii = {
            tok for tok in query_tokens_ascii if tok not in _VIETNAMESE_STOPWORDS
        }
        if not meaningful_tokens:
            meaningful_tokens = query_tokens
        if not meaningful_ascii:
            meaningful_ascii = query_tokens_ascii

        matched_kw_weight = 0.0
        for kw_norm, kw_ascii, word_count in entry["kw_entries"]:
            weight = 1.0 + 0.5 * max(0, word_count - 1)
            if f" {kw_norm} " in f" {query_norm} " or (
                len(query_norm) >= 4 and query_norm in kw_norm
            ):
                matched_kw_weight += weight
            elif f" {kw_ascii} " in f" {query_ascii} " or (
                len(query_ascii) >= 4 and query_ascii in kw_ascii
            ):
                matched_kw_weight += 0.9 * weight

        kw_phrase_score = min(1.0, matched_kw_weight / 3.0)

        denom = max(1, len(meaningful_tokens))
        denom_ascii = max(1, len(meaningful_ascii))

        exact_title_hits = len(meaningful_tokens & entry["title_kw_tokens"]) / denom
        ascii_title_hits = len(meaningful_ascii & entry["title_kw_tokens_ascii"]) / denom_ascii
        title_coverage = max(exact_title_hits, 0.9 * ascii_title_hits)

        exact_content_hits = len(meaningful_tokens & entry["content_tokens"]) / denom
        ascii_content_hits = len(meaningful_ascii & entry["content_tokens_ascii"]) / denom_ascii
        content_coverage = max(exact_content_hits, 0.9 * ascii_content_hits)

        combined = 0.45 * kw_phrase_score + 0.40 * title_coverage + 0.15 * content_coverage
        return max(0.0, min(1.0, combined))

    def retrieve(self, query: str, top_k: int = 3) -> list[dict[str, Any]]:
        """
        Truy xuất top_k tài liệu liên quan nhất theo Hybrid Scoring:
        - Nếu có GEMINI_API_KEY và embed thành công:
          final_score = 0.65 * semantic_score + 0.35 * keyword_score
        - Nếu chưa cấu hình API Key hoặc lỗi gọi API:
          final_score = keyword_score (100% Keyword/Tag Matching)
        """
        clean_query = (query or "").strip()
        if not clean_query or top_k <= 0 or not self._doc_index:
            return []

        query_vec: Optional[list[float]] = None
        if self._ensure_document_embeddings():
            query_vec = self._embed_query(clean_query)

        use_semantic = query_vec is not None
        scored_results: list[tuple[float, dict[str, Any]]] = []

        for entry in self._doc_index:
            keyword_score = self._compute_keyword_score(clean_query, entry)
            semantic_score = 0.0

            if use_semantic and query_vec is not None:
                doc_vec = self._embeddings.get(entry["doc_id"])
                if doc_vec:
                    semantic_score = cosine_similarity(query_vec, doc_vec)
                    final_score = 0.65 * semantic_score + 0.35 * keyword_score
                else:
                    final_score = keyword_score
            else:
                final_score = keyword_score

            doc_copy = dict(entry["doc"])
            doc_copy["score"] = round(final_score, 4)
            doc_copy["keyword_score"] = round(keyword_score, 4)
            doc_copy["semantic_score"] = round(semantic_score, 4) if use_semantic else None
            scored_results.append((final_score, doc_copy))

        scored_results.sort(key=lambda item: item[0], reverse=True)
        return [item[1] for item in scored_results[:top_k]]
