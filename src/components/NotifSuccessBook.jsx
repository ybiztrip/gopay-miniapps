import { useEffect } from 'react';
export default function NotifSuccessBook({ visible, hotelName, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000); // auto-close after 4s
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl px-5 py-4 flex items-start gap-4 border border-green-100 animate-slide-up">
        <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">Booking Successful! 🎉</p>
          {hotelName && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              Your reservation at <span className="font-semibold text-gray-700">{hotelName}</span> has been confirmed.
            </p>
          )}
        </div>
        <button onClick={onClose} className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}