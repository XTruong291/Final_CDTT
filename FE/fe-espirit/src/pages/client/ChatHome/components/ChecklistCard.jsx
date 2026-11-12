import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

export default function ChecklistCard({ data }) {
  const [items, setItems] = useState(
    data.items || [
      { id: 1, text: 'Hương hoa', checked: false },
      { id: 2, text: 'Trái cây ngũ quả', checked: false },
      { id: 3, text: 'Trầu cau', checked: false },
    ]
  );

  const toggleCheck = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const progress = Math.round(
    (items.filter((i) => i.checked).length / items.length) * 100
  ) || 0;

  return (
    <div className="my-2 flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:max-w-md">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          {data.title || 'Danh sách mâm cúng'}
        </h3>
        <span className="text-xs font-medium text-gray-500">{progress}% hoàn thành</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="flex flex-col p-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="group flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
          >
            <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleCheck(item.id)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-1"
              />
              <Check
                size={14}
                className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100"
                strokeWidth={3}
              />
            </div>
            <span
              className={`text-[15px] leading-relaxed transition-all duration-200 ${
                item.checked ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}
            >
              {item.text}
            </span>
          </label>
        ))}
      </div>

      {/* Action footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 p-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30">
          <ShoppingCart size={16} />
          <span>Mua combo này trên Shopee</span>
        </button>
      </div>
    </div>
  );
}
