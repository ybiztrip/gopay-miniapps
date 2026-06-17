import { X, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import currencyFormatter from '../helpers/currency.js';
import { useBooking } from '../hooks/useBooking.js';
import { useBookingDetail } from '../hooks/useBookingDetail.js';
import { useState, useEffect, useRef } from 'react';

// ── Helper: random delay 5–10 detik ────────────────────────────────────────
const randomDelay = () => Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;

export default function BookingModal({ guest, room, hotel, checkIn, checkOut, themeColor, onClose, onSuccess }) {
  const token = localStorage.getItem('gopayAuthToken') || '';
  const { loading, error, booking, reset } = useBooking();
  const { loading: detailLoading, error: detailError, bookingDetail } = useBookingDetail();

  const [paymentUrl, setPaymentUrl]   = useState(null); // ✅ simpan URL setelah dapat
  const [flowError, setFlowError]     = useState(null);
  const [countdown, setCountdown]     = useState(null);

  const countdownIntervalRef = useRef(null);

  const isProcessing = loading || detailLoading || countdown !== null;
  const nightlyPrice = room?.nightlyRates?.displaySellAmount;
  const currency     = room?.nightlyRates?.displayCurrency;
  const taxCharge    = room?.charges?.find((c) => c.type === 'TAX');

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // ── Countdown timer ──────────────────────────────────────────────────────
  const startCountdown = (durationMs) => {
    return new Promise((resolve) => {
      let remaining = Math.ceil(durationMs / 1000);
      setCountdown(remaining);

      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setCountdown(null);
          resolve();
        }
      }, 1000);
    });
  };

  const handleConfirm = async () => {
    setFlowError(null);
    setPaymentUrl(null);

    // ── Step 1: Hit booking API ──────────────────────────────────────────
    const result = await booking({
      startDate:          checkIn,
      endDate:            checkOut,
      contactEmail:       guest?.contactEmail ?? '',
      contactFirstName:   guest?.contactFirstName ?? '',
      contactLastName:    guest?.contactLastName ?? '',
      contactTitle:       'MR',
      contactNationality: guest?.contactNationality ?? '',
      contactPhoneCode:   guest?.contactPhoneCode ?? '',
      contactPhoneNumber: guest?.contactPhoneNumber ?? '',
      contactDob:         '',
      hotel: {
        clientSource:      'BIZTRIP',
        itemId:            hotel?.propertyId ?? '',
        roomId:            room?.roomId ?? '',
        rateKey:           room?.rateKey ?? '',
        numRoom:           1,
        checkInDate:       checkIn,
        checkOutDate:      checkOut,
        partnerSellAmount: nightlyPrice ?? 0,
        partnerNettAmount: nightlyPrice ?? 0,
        currency:          currency ?? 'IDR',
        metadata: {
          name:     hotel?.propertySummary?.name ?? '',
          roomName: room?.roomName ?? '',
          address:  hotel?.propertySummary?.address ?? '',
        }
      },
      paxs: [{
        firstName:      guest?.contactFirstName ?? '',
        lastName:       guest?.contactLastName ?? '',
        title:          'MR',
        gender:         guest?.contactGender?.toUpperCase() ?? '',
        type:           'ADULT',
        email:          guest?.contactEmail ?? '',
        nationality:    guest?.contactNationality ?? '',
        phoneCode:      guest?.contactPhoneCode ?? '',
        phoneNumber:    guest?.contactPhoneNumber ?? '',
        dob:            '',
        issuingCountry: guest?.contactNationality ?? '',
        documentType:   '',
        documentNo:     '',
      }]
    }, token);

    if (!result?.data) {
      setFlowError(error || 'Booking failed. Please try again.');
      return;
    }

    // ── Step 2: Tunggu 5-10 detik dengan countdown ──────────────────────
    await startCountdown(randomDelay());

    // ── Step 3: Hit bookingDetail API ────────────────────────────────────
    const bookingId    = result?.data?.bookingId ?? '';
    const detailResult = await bookingDetail(bookingId, token);

    if (!detailResult) {
      setFlowError(detailError || 'Failed to retrieve booking detail.');
      return;
    }

    // ── Step 4: Simpan paymentUrl ke state ───────────────────────────────
    const url = detailResult?.data?.hotels?.[0]?.paymentUrl;

    if (!url) {
      setFlowError('Payment URL not available. Please check your transaction history.');
      return;
    }

    // ✅ Loading selesai, tampilkan tombol payment ke user
    setPaymentUrl(url);
  };

  const handleClose = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setPaymentUrl(null);
    setFlowError(null);
    reset();
    onClose();
  };

  const handlePayNow = (url) => {
    window.open(url, '_blank');
    onSuccess?.();
  };

  // ── Payment Ready State — tampil setelah dapat paymentUrl ───────────────
  if (paymentUrl) {
    return (
      <ModalWrapper onClose={handleClose}>
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Booking Confirmed!</h2>
            <p className="text-gray-500 text-sm">
              Your booking for{' '}
              <span className="font-semibold text-gray-700">{room?.roomName}</span>{' '}
              is ready. Click below to complete your payment.
            </p>
          </div>

          {/* ✅ Direct user click */}
          <a
            onClick={() => handlePayNow(paymentUrl)}
            className={`${themeColor} text-white w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95`}
          >
            <ExternalLink className="w-4 h-4" />
            Open Payment Page
          </a>

          <button
            onClick={handleClose}
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </ModalWrapper>
    );
  }

  // ── Loading / Countdown Overlay ──────────────────────────────────────────
  if (isProcessing) {
    const isWaiting = countdown !== null;

    const loadingTitle = loading
      ? 'Creating your booking...'
      : isWaiting
        ? 'Processing your booking...'
        : 'Retrieving booking details...';

    const loadingSubtitle = loading
      ? 'Submitting your reservation'
      : isWaiting
        ? 'This may take a moment, please wait'
        : 'Almost done, hang tight!';

    return (
      <ModalWrapper onClose={() => {}}>
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-5">
          <div className="relative flex items-center justify-center w-20 h-20">
            <Loader2 className="w-20 h-20 animate-spin text-blue-200 absolute" />
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 absolute" style={{ animationDuration: '0.8s' }} />
            {isWaiting && (
              <span className="text-lg font-bold text-blue-600 z-10">{countdown}s</span>
            )}
          </div>

          <div>
            <p className="text-base font-bold text-gray-800">{loadingTitle}</p>
            <p className="text-xs text-gray-400 mt-1">{loadingSubtitle}</p>
          </div>

          {isWaiting && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-1000 ease-linear"
                style={{ width: `${((30 - countdown) / 30) * 100}%` }}
              />
            </div>
          )}

          <p className="text-xs text-gray-300">Please do not close this window</p>
        </div>
      </ModalWrapper>
    );
  }

  // ── Confirm State ────────────────────────────────────────────────────────
  return (
    <ModalWrapper onClose={handleClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-base font-bold text-gray-800">Confirm Booking</h2>
        <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Room Summary */}
      <div className="px-5 py-5 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">

          {/* Hotel & Room Name */}
          <div>
            <p className="text-xs text-gray-400">{hotel?.propertySummary?.name}</p>
            <p className="font-bold text-gray-800 text-sm mt-0.5">{room?.roomName}</p>
          </div>

          <div className="border-t border-blue-100" />

          {/* Check-in / Check-out */}
          {(checkIn || checkOut) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Check-in</p>
                <p className="text-sm font-semibold text-gray-700">{checkIn ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Check-out</p>
                <p className="text-sm font-semibold text-gray-700">{checkOut ?? '—'}</p>
              </div>
            </div>
          )}

          <div className="border-t border-blue-100" />

          {/* Price */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400">Price per night</p>
              <p className="text-xl font-bold text-blue-900">
                {currencyFormatter(nightlyPrice, currency)}
              </p>
              {taxCharge && (
                <p className="text-xs text-gray-400 mt-0.5">
                  + {currencyFormatter(taxCharge.displayAmount, taxCharge.displayCurrency)} tax
                </p>
              )}
            </div>
            {room?.isRefundable && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                Refundable
              </span>
            )}
          </div>
        </div>

        {(flowError || error || detailError) && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {flowError || error || detailError}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleClose}
            className="py-2.5 rounded-xl font-bold text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`${themeColor} text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95`}
          >
            Confirm
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ── Modal Wrapper ────────────────────────────────────────────────────────────
function ModalWrapper({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}