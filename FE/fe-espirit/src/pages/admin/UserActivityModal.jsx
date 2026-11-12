import { X } from 'lucide-react';

export default function UserActivityModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  // Helper cho Avatar Text
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header: Tóm tắt User */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 bg-[#FAF5EC]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#CAA46A]/20 text-sm font-bold text-[#2A1610]">
              {getInitials(user.name)}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2A1610]">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              
              <div className="mt-2 flex items-center gap-2">
                {user.status === 'active' ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Đang hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 border border-red-200">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Đã khóa
                  </span>
                )}
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">Tần suất: <span className="font-medium text-gray-700">{user.frequency}</span></span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Timeline Component */}
        <div className="overflow-y-auto p-6 flex-1">
          <h4 className="mb-6 font-medium text-gray-900 border-b border-gray-100 pb-2">Lịch sử hoạt động gần đây</h4>
          
          <div className="space-y-6">
            {(!user.activityHistory || user.activityHistory.length === 0) ? (
              <p className="text-center text-gray-500 italic py-4">Người dùng này chưa có hoạt động nào.</p>
            ) : (
              <div className="relative border-l-2 border-gray-100 pl-5 ml-2 space-y-7">
                {user.activityHistory.map((act, index) => (
                  <div key={index} className="relative">
                    {/* Chấm tròn mốc thời gian */}
                    <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#CAA46A]"></div>
                    
                    {/* Content Timeline */}
                    <p className="text-xs font-semibold text-[#CAA46A] mb-1">{act.time}</p>
                    <div className="rounded-lg bg-gray-50/80 p-3 text-sm text-gray-700 border border-gray-100/50">
                      {act.action}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CAA46A] focus:ring-offset-1"
          >
            Đóng
          </button>
        </div>
        
      </div>
    </div>
  );
}
