import React, { useState } from 'react';
import { Search, Calendar, User, Minus, Plus, X } from 'lucide-react';

function SearchBar() {
  // Ganti dengan warna tema Anda
  const accentColor = "bg-blue-600";

  // --- STATE ---
  const [location, setLocation] = useState("");

  // State untuk Tanggal
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State untuk Tamu & Kamar
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // --- HANDLERS ---

  // Format tanggal menjadi "DD Month" (Misal: 10 Agu)
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Handler update tamu/kamar (mencegah nilai negatif)
  const updateCount = (type, operation) => {
    if (type === 'rooms') {
      setRooms(prev => operation === 'inc' ? prev + 1 : Math.max(1, prev - 1));
    } else {
      setGuests(prev => operation === 'inc' ? prev + 1 : Math.max(1, prev - 1));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 relative">

      {/* Overlay untuk menutup popup ketika klik di luar */}
      {(showDatePicker || showGuestPicker) && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => {
            setShowDatePicker(false);
            setShowGuestPicker(false);
          }}
        />
      )}

      <div className="space-y-3 relative z-20">

        {/* 1. INPUT LOKASI */}
        <div className="bg-white rounded-full p-1.5 shadow-lg flex items-center">
          <div className={`${accentColor} w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0`}>
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Pilih kota tujuan"
            className="flex-1 ml-3 outline-none text-gray-700 font-medium placeholder:text-gray-500 bg-transparent text-lg"
          />
        </div>

        <div className="flex space-x-2 relative">

          {/* 2. DATE PICKER SECTION */}
          <div
            className="bg-white rounded-full p-1.5 shadow-lg flex items-center flex-1 w-[55%] cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              setShowGuestPicker(false);
              setShowDatePicker(!showDatePicker);
            }}
          >
            <div className={`${accentColor} w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div className="ml-3 leading-tight overflow-hidden select-none">
              {checkIn ? (
                // Tampilan jika tanggal sudah dipilih
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold text-sm">
                    {formatDate(checkIn)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    - {checkOut ? formatDate(checkOut) : 'Check-out?'}
                  </span>
                </div>
              ) : (
                // Tampilan default (placeholder)
                <>
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">Tgl Check-in</div>
                  <div className="text-gray-500 text-xs whitespace-nowrap">& Check-out</div>
                </>
              )}
            </div>

            {/* POPUP DATE INPUT */}
            {showDatePicker && (
              <div
                className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl p-4 z-30 border border-gray-100"
                onClick={(e) => e.stopPropagation()} // Mencegah popup tertutup saat diklik isinya
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">CHECK-IN</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">CHECK-OUT</label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn} // Minimal tanggal checkout adalah tanggal checkin
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className={`w-full ${accentColor} text-white py-2 rounded-lg text-sm font-bold mt-2`}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. GUEST & ROOM SECTION */}
          <div
            className="bg-white rounded-full p-1.5 shadow-lg flex items-center flex-1 w-[45%] cursor-pointer hover:bg-gray-50 transition-colors relative"
            onClick={() => {
              setShowDatePicker(false);
              setShowGuestPicker(!showGuestPicker);
            }}
          >
            <div className={`${accentColor} w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0`}>
              <User className="w-5 h-5" />
            </div>
            <div className="ml-3 text-sm text-gray-700 font-bold leading-tight select-none">
              <div className="flex justify-between w-full">
                <span className="font-normal text-gray-500 mr-1">Kamar:</span> {rooms}
              </div>
              <div className="flex justify-between w-full">
                <span className="font-normal text-gray-500 mr-1">Tamu:</span> {guests}
              </div>
            </div>

            {/* POPUP GUEST INPUT */}
            {showGuestPicker && (
              <div
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl p-4 z-30 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  {/* Counter Kamar */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Kamar</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateCount('rooms', 'dec')}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-4 text-center font-bold">{rooms}</span>
                      <button
                        onClick={() => updateCount('rooms', 'inc')}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Counter Tamu */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Tamu</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateCount('guests', 'dec')}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-4 text-center font-bold">{guests}</span>
                      <button
                        onClick={() => updateCount('guests', 'inc')}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGuestPicker(false)}
                    className={`w-full ${accentColor} text-white py-2 rounded-lg text-sm font-bold mt-2`}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. SEARCH BUTTON */}
        <div className="flex justify-center pt-2">
          <button
            className={`${accentColor} px-16 py-2 text-white font-bold rounded-full shadow-xl hover:opacity-90 transition-transform active:scale-95 text-lg`}
            onClick={() => console.log({ location, checkIn, checkOut, rooms, guests })}
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;