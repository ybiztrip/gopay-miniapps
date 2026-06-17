import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, CreditCard } from 'lucide-react';
import moment from 'moment';
import currencyFormatter from '../helpers/currency.js';
import { getBookingDetail } from '../service/bookingService.js';

export default function TransactionDetailModal({ booking, visible, onClose }) {
  const token = localStorage.getItem('gopayAuthToken') || '';
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible && booking?.bookingId) {
      setLoading(true);
      const controller = new AbortController();
      
      getBookingDetail(booking?.bookingId, token, controller.signal)
        .then((res) => {
          setDetail(res?.data ?? res);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Failed to load booking detail:', err);
          }
        })
        .finally(() => setLoading(false));

      return () => controller.abort();
    } else {
      setDetail(null);
    }
  }, [visible, booking?.bookingId, token]);

  if (!visible) return null;

  const data = detail || booking;
  const statusColor = {
    issued: 'bg-green-100 text-green-700',
    waiting_payment: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-gray-100 text-gray-500',
    paid:      'bg-blue-100 text-blue-700',
    booking:   'bg-cyan-100 text-cyan-700',
  };
  let status = data?.hotels?.[0]?.status || 'UNKNOWN';
  if (status == 'APPROVED') {
    status = 'BOOKING';
  }

  const statusClass = statusColor[status?.toLowerCase()] || 'bg-gray-100 text-gray-500';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800">Booking Detail</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading detail...</p>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-5">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">
                #{data?.hotels?.[0]?.bookingId || '-'}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusClass}`}>
                {status?.replace('_', ' ') || status}
              </span>
            </div>

            {/* Hotel Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-gray-800 text-base">
                {data?.hotels?.[0]?.metadata?.name || 'Hotel'}
              </h3>

              <div className="flex items-start text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{data?.hotels?.[0]?.metadata?.address?.lines?.join(', ')|| '-'}</span>
              </div>

              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  {data?.hotels?.[0]?.checkInDate ? moment(data.hotels[0].checkInDate).format('DD MMM YYYY') : '-'}
                  {' → '}
                  {data?.hotels?.[0]?.checkOutDate ? moment(data.hotels[0].checkOutDate).format('DD MMM YYYY') : '-'}
                </span>
              </div>

              <div className="flex items-center text-gray-500 text-sm">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>
                  {data?.hotels?.[0]?.numRooms || 1} Room · {data?.hotels?.[0]?.paxs?.length|| 1} Guest(s)
                </span>
              </div>
            </div>

            {/* Room Info */}
            {(data?.hotels?.[0]?.metadata?.roomName) && (
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Room Type</p>
                <p className="font-semibold text-gray-800">{data?.hotels?.[0]?.metadata?.roomName}</p>
              </div>
            )}

            {/* Guest Info */}
            {(data?.contactFirstName || data?.contactLastName) && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-400">Guest Information</p>
                <p className="font-semibold text-gray-800">{data?.contactFirstName} {data?.contactLastName}</p>
                {(data?.contactEmail) && (
                  <p className="text-sm text-gray-500">{data?.contactEmail}</p>
                )}
                {(data?.contactPhoneNumber) && (
                  <p className="text-sm text-gray-500">{data?.contactPhoneNumber}</p>
                )}
              </div>
            )}

            {/* Payment Info */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center mb-1">
                <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                <p className="text-xs text-gray-400">Payment Summary</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-blue-900">
                  {currencyFormatter(
                    Number(data?.hotels?.[0]?.partnerSellAmount || 0),
                    data?.hotels?.[0]?.currency || 'IDR'
                  )}
                </span>
              </div>
            </div>

            {/* Created At */}
            {data?.createdAt && (
              <p className="text-xs text-gray-400 text-center">
                Booked on {moment(data.createdAt).format('DD MMM YYYY, HH:mm')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}