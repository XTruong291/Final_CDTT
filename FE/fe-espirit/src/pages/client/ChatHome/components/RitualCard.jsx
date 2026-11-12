import { Copy, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function RitualCard({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 flex w-full max-w-sm flex-col rounded-xl border border-[#D4AF37]/30 bg-[#FDFBF7] shadow-sm sm:max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 bg-amber-50/50 px-4 py-3">
        <h3 className="font-serif text-lg font-semibold text-[#2A1610]">
          {data.title || 'Văn khấn cổ truyền'}
        </h3>
      </div>

      {/* Content (Tờ Sớ) */}
      <div className="p-5">
        <div className="whitespace-pre-line text-center font-serif text-base leading-relaxed text-[#2A1610] sm:text-lg sm:leading-loose">
          {data.content}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-[#D4AF37]/20 bg-white/50 px-4 py-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
        >
          {copied ? (
            <CheckCircle2 size={16} className="text-emerald-600" />
          ) : (
            <Copy size={16} />
          )}
          <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
        </button>

        <div className="flex items-center gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-green-600 focus:outline-none">
            <ThumbsUp size={16} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 focus:outline-none">
            <ThumbsDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
