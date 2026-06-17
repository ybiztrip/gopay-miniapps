import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Eye, RefreshCw, ArrowDown } from 'lucide-react';
import moment from 'moment';

// Hooks
import { useTransactionHistory } from '../hooks/useTransactionHistory.js';
import { useGetETicket } from '../hooks/useGetETicket.js';
import { usePullToRefresh } from '../hooks/usePullToRefresh.js';

// Components
import TransactionDetailModal from '../components/TransactionDetailModal.jsx';

// Helpers
import currencyFormatter from '../helpers/currency.js';
import { DATA } from '../data/data.js';

export default function TransactionHistory() {
  const token = localStorage.getItem('gopayAuthToken') || '';
  const navigate = useNavigate();
  const currentData = DATA[import.meta.env.VITE_ACTIVE_ENV] || DATA['este'];

  const { transactions, loading, error, fetchHistory } = useTransactionHistory();
  const { fetchETicket } = useGetETicket();

  // State: detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetail, setShowDetail]           = useState(false);

  // Ref: scroll container (untuk pull-to-refresh detection)
  const scrollRef = useRef(null);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory(token);
  }, [fetchHistory, token]);

  // ─── Pull-to-refresh handler ───
  const handleRefresh = useCallback(async () => {
    await fetchHistory(token);
  }, [fetchHistory, token]);

  const {
    pullDistance,
    isRefreshing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    THRESHOLD,
  } = usePullToRefresh(handleRefresh, scrollRef);

  // ─── Action 1: Fetch Payment URL ───
  const handlePayNow = async (paymentUrl) => {
    window.open(paymentUrl, '_blank');
  };

  // ─── Action 2: View Detail ───
  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetail(true);
  };

  // ─── Action 3: View E-Ticket ───
  const handleViewETicket = async (bookingCode) => {
    const res = await fetchETicket(bookingCode, token);
    // Convert blob → object URL → open
    const blob = new Blob([res], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // Helper: check if booking payment is expired
  const isExpired = (booking) => {
    if (booking?.status?.toLowerCase() === 'cancelled') return true;
    return false;
  };

  // Helper: status badge styling
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    const styles = {
      issued:          'bg-green-100 text-green-700',
      paid:            'bg-blue-100 text-blue-700',
      booking:         'bg-cyan-100 text-cyan-700',
      waiting_payment: 'bg-yellow-100 text-yellow-700',
      cancelled:       'bg-gray-100 text-gray-500',
    };
    return styles[s] || 'bg-gray-100 text-gray-500';
  };

  // Pull-to-refresh indicator progress (0–1)
  const pullProgress = Math.min(pullDistance / THRESHOLD, 1);
  const isPulling    = pullDistance > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-md h-screen bg-white shadow-2xl overflow-hidden flex flex-col relative">

        {/* ─── Header ─── */}
        <div className={`flex-shrink-0 ${currentData?.themeColor || 'bg-blue-600'} px-4 pt-14 pb-5`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Transaction History</h1>
              <p className="text-white/70 text-xs">Your booking records</p>
            </div>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* ─── Pull-to-Refresh Indicator ─── */}
          <div
            style={{
              height: isRefreshing ? 64 : `${pullDistance}px`,
              transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
            }}
            className="flex items-center justify-center"
          >
            <div
              style={{ opacity: isRefreshing ? 1 : pullProgress }}
              className="flex flex-col items-center gap-1 text-blue-500"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-medium text-gray-500">Refreshing...</span>
                </>
              ) : (
                <>
                  <div
                    style={{ transform: `rotate(${pullProgress * 180}deg)`, transition: 'transform 0.1s' }}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && !isRefreshing && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 px-6">
              <p className="text-4xl mb-3">⚠️</p>
              <p className="font-medium text-gray-600 text-center">{error}</p>
              <button
                onClick={() => fetchHistory(token)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Your booking history will appear here</p>
            </div>
          )}

          {/* Transaction List */}
          {!loading && !error && transactions.length > 0 && (
            <div className="px-4 py-4 space-y-4">
              {transactions.map((booking) => {
                const bookingId = booking?.bookingId || booking?.id;
                const hotelData = booking?.hotels?.[0] || {};
                const expired   = isExpired(hotelData);
                let status = hotelData?.status || 'UNKNOWN';
                if (status === 'APPROVED') {
                  status = 'BOOKING';
                }

                return (
                  <div
                    key={bookingId}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="font-bold text-gray-800 text-sm truncate">
                            {hotelData?.metadata?.name || 'Hotel Booking'}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            #{bookingId}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${getStatusBadge(status)}`}>
                          {status?.replace('_', ' ') || status}
                        </span>
                      </div>

                      {/* Date & Amount */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {hotelData?.checkInDate
                            ? `${moment(hotelData.checkInDate).format('DD MMM')} - ${moment(hotelData.checkOutDate).format('DD MMM YYYY')}`
                            : '-'
                          }
                        </div>
                        <span className="text-sm font-bold text-blue-900">
                          {currencyFormatter(
                            Number(hotelData?.partnerSellAmount || 0),
                            hotelData?.currency || 'IDR'
                          )}
                        </span>
                      </div>

                      {/* Expired Warning Badge */}
                      {expired && (
                        <div className="mt-2 flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Payment expired
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                      {/* Action: View Detail (selalu muncul) */}
                      <button
                        onClick={() => handleViewDetail(hotelData)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Detail
                      </button>

                      {/* Action: Pay Now (hanya untuk yang memiliki paymentUrl) */}
                      {hotelData?.paymentUrl && (
                        <button
                          onClick={() => status?.toLowerCase() === 'issued' ? handleViewETicket(hotelData.bookingCode) : handlePayNow(hotelData.paymentUrl)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {status?.toLowerCase() === 'issued' ? 'E-Ticket' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Bottom Padding */}
              <div className="h-6" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Transaction Detail Modal ─── */}
      <TransactionDetailModal
        booking={selectedBooking}
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}