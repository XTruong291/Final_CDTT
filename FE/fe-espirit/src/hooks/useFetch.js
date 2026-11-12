// TODO: hook gọi API dùng chung (loading, data, error) — dùng cho các trang danh sách/chi tiết.
export function useFetch(fetcher, deps = []) {
  // TODO: implement với useEffect + fetcher()
  return { data: null, loading: false, error: null };
}
