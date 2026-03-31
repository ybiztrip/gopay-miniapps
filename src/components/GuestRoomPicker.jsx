import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, X, Check, Minus, Plus } from 'lucide-react';

// ============================================================
// COUNTER ROW — satu baris item dengan tombol +/-
// ============================================================
function CounterRow({ label, sublabel, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`rounded-full border-2 flex items-center justify-center transition-all
            ${value <= min
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-[#013440] text-[#013440] hover:bg-[#013440] hover:text-white active:scale-95'
            }`}
        >
          <Minus size={14} />
        </button>

        <span className="w-6 text-center text-base font-bold text-gray-800 tabular-nums">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`rounded-full border-2 flex items-center justify-center transition-all
            ${value >= max
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-[#013440] text-[#013440] hover:bg-[#013440] hover:text-white active:scale-95'
            }`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM SHEET — via React Portal
// ============================================================
function GuestRoomBottomSheet({ isOpen, onClose, rooms, guests, onConfirm }) {
  const [localRooms, setLocalRooms] = useState(rooms);
  const [localGuests, setLocalGuests] = useState(guests);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setLocalRooms(rooms);
      setLocalGuests(guests);
    } else {
      setVisible(false);
    }
  }, [isOpen, rooms, guests]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Saat kamar bertambah, pastikan tamu minimal = jumlah kamar
  const handleRoomsChange = (val) => {
    setLocalRooms(val);
    if (localGuests < val) setLocalGuests(val);
  };

  const handleConfirm = () => {
    onConfirm({ rooms: localRooms, guests: localGuests });
    onClose();
  };

  if (!isOpen && !visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end" style={{ fontFamily: 'inherit' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Room & Guest</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Counter list */}
        <div className="px-5 pb-2">
          <CounterRow
            label="Room"
            sublabel="Maximum 8 rooms"
            value={localRooms}
            min={1}
            max={8}
            onChange={handleRoomsChange}
          />
          <CounterRow
            label="Adult Guest"
            sublabel="Age 18 years and above"
            value={localGuests}
            min={localRooms} // minimal 1 tamu per kamar
            max={16}
            onChange={setLocalGuests}
          />
        </div>

        {/* Info note */}
        <div className="mx-5 mb-4 bg-blue-50 rounded-xl px-4 py-2.5">
          <p className="text-xs text-blue-600 font-medium">
            💡 Minimal {localRooms} guest for {localRooms} room(s) selected
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#013440] text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Check size={15} />
            Apply — {localRooms} Room, {localGuests} Guest
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ============================================================
// MAIN EXPORT — Trigger Button + Bottom Sheet
// Pemakaian di HomeView:
//   <GuestRoomPicker onConfirm={({ rooms, guests }) => { ... }} />
// ============================================================
export default function GuestRoomPicker({ onConfirm }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);

  const handleConfirm = ({ rooms: r, guests: g }) => {
    setRooms(r);
    setGuests(g);
    onConfirm?.({ rooms: r, guests: g });
  };

  return (
    <>
      {/* TRIGGER — style persis seperti yang asli di HomeView */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-full p-1.5 shadow-lg flex items-center w-full text-left active:scale-[0.98] transition-transform"
      >
        <div className="bg-[#013440] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div className="ml-3 text-sm text-gray-700 font-bold leading-tight">
          <div className="flex gap-1">
            <span className="font-normal text-gray-500">Room:</span>
            <span>{rooms}</span>
          </div>
          <div className="flex gap-1">
            <span className="font-normal text-gray-500">Guest:</span>
            <span>{guests}</span>
          </div>
        </div>
      </button>

      <GuestRoomBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        rooms={rooms}
        guests={guests}
        onConfirm={handleConfirm}
      />
    </>
  );
}