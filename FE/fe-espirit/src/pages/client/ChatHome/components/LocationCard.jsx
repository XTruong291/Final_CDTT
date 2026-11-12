import { MapPin, Star } from 'lucide-react';

export default function LocationCard({ data }) {
  const { name, address, rating, distance } = data || {
    name: 'Đền Quán Thánh',
    address: 'Thanh Niên, Quán Thánh, Ba Đình, Hà Nội',
    rating: 4.8,
    distance: '2.5 km',
  };

  return (
    <div className="my-2 flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:max-w-md">
      <div className="flex items-start gap-3 p-4">
        {/* Placeholder cho ảnh địa điểm */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <MapPin size={24} className="text-gray-400" />
        </div>

        <div className="flex flex-1 flex-col">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{address}</p>
          
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-700">{rating}</span>
            </div>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="text-xs font-medium text-gray-500">{distance}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-2.5">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm border border-gray-200 transition-colors hover:bg-blue-50 focus:outline-none">
          <MapPin size={16} />
          <span>Chỉ đường</span>
        </button>
      </div>
    </div>
  );
}
