import { useEffect } from 'react';

export default function NotifExpired({ visible, message, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 5000); // auto-close after 5s
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl px-5 py-4 flex items-start gap-4 border border-red-100 animate-slide-up">
        <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">Payment Expired ⏰</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {message || 'The payment for this booking has expired. Please create a new booking.'}
          </p>
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