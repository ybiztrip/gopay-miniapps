import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import moment from 'moment';

// ============================================================
// UTILS
// ============================================================
const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];
const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isBetween(date, start, end) {
  if (!start || !end || !date) return false;
  return date > start && date < end;
}
function formatShort(date) {
  if (!date) return null;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}
function countNights(start, end) {
  if (!start || !end) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

// ============================================================
// CALENDAR MONTH GRID
// ============================================================
function MonthGrid({ year, month, checkIn, checkOut, hoverDate, onDayClick, onDayHover }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  return (
    <div className="mb-4">
      <div className="text-center font-bold text-gray-700 text-sm py-3">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;

          const isPast = date < today;
          const isStart = isSameDay(date, checkIn);
          const isEnd = isSameDay(date, checkOut);
          const effectiveEnd = checkOut || hoverDate;
          const isRange = isBetween(date, checkIn, effectiveEnd);
          const isHoverEnd = !checkOut && isSameDay(date, hoverDate) && checkIn && date > checkIn;

          const isStartOfWeek = date.getDay() === 0;
          const isEndOfWeek = date.getDay() === 6;
          const isFirstOfMonth = date.getDate() === 1;
          const isLastOfMonth = date.getDate() === daysInMonth;

          const showRangeBg = isRange || isHoverEnd;

          return (
            <div key={idx} className="relative flex items-center justify-center h-9">
              {/* Range fill - left half */}
              {showRangeBg && !isStartOfWeek && !isFirstOfMonth && (
                <div className="absolute inset-y-1 left-0 w-1/2 bg-teal-50" />
              )}
              {/* Range fill - right half */}
              {showRangeBg && !isEndOfWeek && !isLastOfMonth && (
                <div className="absolute inset-y-1 right-0 w-1/2 bg-teal-50" />
              )}
              {/* Tail from start */}
              {isStart && checkOut && !isEndOfWeek && !isLastOfMonth && (
                <div className="absolute inset-y-1 right-0 w-1/2 bg-teal-50" />
              )}
              {/* Tail to end */}
              {isEnd && !isStartOfWeek && !isFirstOfMonth && (
                <div className="absolute inset-y-1 left-0 w-1/2 bg-teal-50" />
              )}

              <button
                type="button"
                disabled={isPast}
                onClick={() => !isPast && onDayClick(date)}
                onMouseEnter={() => !isPast && onDayHover(date)}
                onMouseLeave={() => onDayHover(null)}
                className={[
                  'relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all font-medium select-none',
                  isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isStart || isEnd
                      ? 'bg-[#013440] text-white font-bold shadow-md cursor-pointer'
                      : isHoverEnd
                        ? 'bg-[#013440]/20 text-[#013440] cursor-pointer'
                        : isRange
                          ? 'text-teal-800 cursor-pointer hover:bg-teal-100'
                          : 'text-gray-700 cursor-pointer hover:bg-gray-100',
                ].join(' ')}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM SHEET (via React Portal → render ke document.body)
// Ini solusi utama agar tidak terclip oleh overflow-y-auto parent
// ============================================================
function CalendarBottomSheet({ isOpen, onClose, checkIn, checkOut, onConfirm }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [localCheckIn, setLocalCheckIn] = useState(null);
  const [localCheckOut, setLocalCheckOut] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selecting, setSelecting] = useState('checkin');
  const [startMonth, setStartMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [visible, setVisible] = useState(false);

  // Animasi masuk/keluar
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setLocalCheckIn(checkIn);
      setLocalCheckOut(checkOut);
      setSelecting(checkIn && !checkOut ? 'checkout' : 'checkin');
    } else {
      setVisible(false);
    }
  }, [isOpen, checkIn, checkOut]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const secondMonth = startMonth.month === 11
    ? { year: startMonth.year + 1, month: 0 }
    : { year: startMonth.year, month: startMonth.month + 1 };

  const prevMonth = () => setStartMonth(prev =>
    prev.month === 0
      ? { year: prev.year - 1, month: 11 }
      : { ...prev, month: prev.month - 1 }
  );
  const nextMonth = () => setStartMonth(prev =>
    prev.month === 11
      ? { year: prev.year + 1, month: 0 }
      : { ...prev, month: prev.month + 1 }
  );

  const handleDayClick = (date) => {
    if (selecting === 'checkin' || !localCheckIn || (localCheckIn && date <= localCheckIn) || localCheckOut) {
      setLocalCheckIn(date);
      setLocalCheckOut(null);
      setSelecting('checkout');
    } else {
      setLocalCheckOut(date);
      setSelecting('done');
    }
  };

  const handleConfirm = () => {
    if (localCheckIn && localCheckOut) {
      onConfirm({ checkIn: localCheckIn, checkOut: localCheckOut });
    }
  };

  const handleReset = () => {
    setLocalCheckIn(null);
    setLocalCheckOut(null);
    setSelecting('checkin');
  };

  const nights = countNights(localCheckIn, localCheckOut);
  const canConfirm = localCheckIn && localCheckOut;

  if (!isOpen && !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Sheet container */}
      <div
        className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          maxHeight: '88vh',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-1 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">
              {selecting === 'checkin'
                ? '📅 Select date check-in'
                : selecting === 'checkout'
                  ? '📅 Select date check-out'
                  : '✅ Date selected'}
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full bg-gray-100 text-black transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-stretch gap-2">
            {/* Check-in pill */}
            <button
              onClick={() => { setSelecting('checkin'); setLocalCheckOut(null); }}
              className={`flex-1 rounded-xl border-2 px-3 py-2 text-left transition-all ${
                selecting === 'checkin'
                  ? 'border-[#013440] bg-[#013440]/5'
                  : 'border-gray-150 bg-gray-50'
              }`}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Check-in</div>
              <div className={`text-sm font-bold ${localCheckIn ? 'text-[#013440]' : 'text-gray-300'}`}>
                {localCheckIn ? formatShort(localCheckIn) : '— —'}
              </div>
            </button>

            <div className="flex items-center text-gray-300 text-sm">→</div>

            {/* Check-out pill */}
            <button
              onClick={() => localCheckIn && setSelecting('checkout')}
              className={`flex-1 rounded-xl border-2 px-3 py-2 text-left transition-all ${
                selecting === 'checkout'
                  ? 'border-[#013440] bg-[#013440]/5'
                  : 'border-gray-150 bg-gray-50'
              }`}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Check-out</div>
              <div className={`text-sm font-bold ${localCheckOut ? 'text-[#013440]' : 'text-gray-300'}`}>
                {localCheckOut ? formatShort(localCheckOut) : '— —'}
              </div>
            </button>
          </div>

          {nights > 0 && (
            <div className="mt-2 text-center text-xs text-teal-700 font-semibold bg-teal-50 rounded-lg py-1.5">
              🌙 {nights} malam
            </div>
          )}
        </div>

        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-gray-50 shrink-0">
          <button onClick={prevMonth} className="flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
            <ChevronLeft size={17} />
          </button>
          <span className="text-xs text-gray-400 font-medium">
            {MONTHS[startMonth.month]} {startMonth.year} — {MONTHS[secondMonth.month]} {secondMonth.year}
          </span>
          <button onClick={nextMonth} className="flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition">
            <ChevronRight size={17} />
          </button>
        </div>

        {/* Scrollable calendars */}
        <div className="flex-1 overflow-y-auto px-4 py-2 overscroll-contain">
          <MonthGrid
            year={startMonth.year}
            month={startMonth.month}
            checkIn={localCheckIn}
            checkOut={localCheckOut}
            hoverDate={hoverDate}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
          />
          <div className="border-t border-dashed border-gray-100 my-1" />
          <MonthGrid
            year={secondMonth.year}
            month={secondMonth.month}
            checkIn={localCheckIn}
            checkOut={localCheckOut}
            hoverDate={hoverDate}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              canConfirm
                ? 'bg-[#013440] text-white shadow-md hover:opacity-90 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canConfirm ? (
              <><Check size={15} /> Confirm — {nights} Nights</>
            ) : (
              'Select check-in & check-out dates'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================
// TRIGGER BUTTON — export utama yang dipakai di HomeView
// ============================================================
export default function DateRangePicker({ onConfirm }) {
  const [isOpen, setIsOpen] = useState(false);
  const [checkIn, setCheckIn] = useState(() => moment().startOf('day').toDate());
  const [checkOut, setCheckOut] = useState(() => moment().add(1, 'days').startOf('day').toDate());

  const handleConfirm = ({ checkIn: ci, checkOut: co }) => {
    setCheckIn(ci);
    setCheckOut(co);
    onConfirm?.({ checkIn: ci, checkOut: co });
    setIsOpen(false);
  };

  const nights = countNights(checkIn, checkOut);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-full p-1.5 shadow-lg flex items-center w-full text-left active:scale-[0.98] transition-transform"
      >
        <div className="bg-[#013440] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="ml-3 leading-tight overflow-hidden">
          {checkIn && checkOut ? (
            <>
              <div className="text-gray-700 font-semibold text-sm truncate">
                {formatShort(checkIn)} → {formatShort(checkOut)}
              </div>
              <div className="text-gray-400 text-xs">{nights} nights</div>
            </>
          ) : (
            <>
              <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Select Date</div>
            </>
          )}
        </div>
      </button>

      <CalendarBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        checkIn={checkIn}
        checkOut={checkOut}
        onConfirm={handleConfirm}
      />
    </>
  );
}