import React, { useState } from 'react';
import {
  Search, Calendar, User, ArrowLeft, Star, MapPin, Wifi, CheckCircle, X,
  ChevronLeft, ChevronRight // <--- Tambahkan ini
} from 'lucide-react';
import { DATA } from '../data/data.js';

export default function Home() {
  const [activeApp, setActiveApp] = useState('este'); // 'este', 'view', 'heal'
  const [view, setView] = useState('home'); // 'home', 'detail'
  const [isLoading, setIsLoading] = useState(false); // State untuk Splash Screen
  const [selectedHotel, setSelectedHotel] = useState(null);
  
  const currentData = DATA[activeApp];

  // Function untuk handle perpindahan Tab dengan Splash Screen 2 detik
  const handleTabChange = (key) => {
    // Jika tab yang diklik sama dengan yang aktif, tidak perlu loading ulang
    if (key === activeApp && view === 'home' && !isLoading) return;

    setActiveApp(key);
    setView('home');
    setSelectedHotel(null);
    setIsLoading(true);

    // Timer 2 detik
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel);
    setView('detail');
  };

  const handleBack = () => {
    setView('home');
    setSelectedHotel(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      {/* Mobile Container */}
      <div className="w-full max-w-md h-screen bg-white shadow-2xl overflow-hidden flex flex-col relative">

        {/* --- LOGIC TAMPILAN --- */}
        {isLoading ? (
          // TAMPILKAN SPLASH SCREEN JIKA LOADING
          <SplashScreen data={currentData} />
        ) : (
          // TAMPILKAN KONTEN UTAMA JIKA TIDAK LOADING
          <>
            {/* --- APP SWITCHER --- */}
            <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center space-x-2 p-2 bg-black/20 backdrop-blur-sm">
              {Object.keys(DATA).map((key) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all ${activeApp === key ? 'bg-white text-black' : 'bg-black/50 text-white'
                    }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide">
              {view === 'home' ? (
                <HomeView
                  data={currentData}
                  onHotelClick={handleHotelClick}
                />
              ) : (
                <DetailView
                  hotel={selectedHotel}
                  themeColor={currentData.themeColor}
                  onBack={handleBack}
                />
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// --- COMPONENT: SPLASH SCREEN ---
function SplashScreen({ data }) {
  return (
    <div className={`w-full h-full ${data.themeColor} flex flex-col items-center justify-center text-white animate-in fade-in duration-300`}>
      {/* Logo Icon */}
      <div className="mb-6 transform scale-150 animate-bounce">
        <span className="text-6xl">🛏️</span>
      </div>

      {/* Logo Text */}
      <h1 className="text-6xl font-extrabold tracking-tighter mb-4 lowercase drop-shadow-md">
        .{data.logoText}.
      </h1>

      {/* Tagline */}
      <p className="font-serif text-xl font-medium text-center px-8 opacity-90 leading-snug">
        {data.tagline}
      </p>
    </div>
  );
}

// --- COMPONENT: HOME VIEW ---
function HomeView({ data, onHotelClick }) {
  const accentColor = "bg-[#013440]";

  return (
    <div>
      {/* Header Section */}
      <div className="relative">
        <div className={`absolute inset-0 ${data.themeColor} z-0`}></div>

        <div className="relative z-10 px-6 pt-16 pb-8">
          {/* Logo Section */}
          <div className="flex flex-row items-center mb-6">
            <div className="bg-white rounded-full p-2 mr-3 shadow-lg">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-3xl">🛏️</span>
              </div>
            </div>
            <h1 className="text-xl font-serif text-white font-bold leading-none tracking-wide">
              {data.tagline} <br />
              {/* <span className="text-sm font-sans font-normal opacity-90 tracking-normal">
                {data.tagline}
              </span> */}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <div className="bg-white rounded-full p-1.5 shadow-lg flex items-center">
              <div className={`${accentColor} w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0`}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="pilih kota"
                className="flex-1 ml-3 outline-none text-gray-700 font-medium placeholder:text-gray-500 bg-transparent text-lg"
              />
            </div>

            <div className="flex space-x-2">
              <div className="bg-white rounded-full p-1.5 shadow-lg flex items-center flex-1 w-[55%]">
                <div className={`${accentColor} w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="ml-3 leading-tight overflow-hidden">
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">tgl check-in</div>
                  <div className="text-gray-700 font-medium text-sm whitespace-nowrap">& check-out</div>
                </div>
              </div>

              <div className="bg-white rounded-full p-1.5 shadow-lg flex items-center flex-1 w-[45%]">
                <div className={`${accentColor} w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="ml-3 text-sm text-gray-700 font-bold leading-tight">
                  <div className="flex justify-between w-full">
                    <span className="font-normal text-gray-500 mr-1">kamar:</span> 1
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="font-normal text-gray-500 mr-1">tamu:</span> 2
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button className={`${accentColor} px-16 py-2 text-white font-bold rounded-full shadow-xl hover:opacity-90 transition-transform active:scale-95 text-lg`}>
                Cari
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel List */}
      <div className="-mt-4 relative z-20 px-4 space-y-5 pb-10">
        {data.hotels.map((hotel) => (
          <div
            key={hotel.id}
            // Hapus onClick di parent container agar swipe tidak mentrigger klik detail
            // Kita pindahkan onClick ke area Text di bawah
            className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform"
          >
            {/* Panggil Image Slider disini */}
            <ImageSlider images={hotel.images} heightClass="h-48" />

            <div
              className="relative -mt-10 mb-10 mr-3 float-right z-30"
              onClick={() => onHotelClick(hotel)} // Price tag klik ke detail
            >
              <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm cursor-pointer">
                Rp {hotel.price}
              </div>
            </div>

            {/* Bagian Teks (Klik disini masuk detail) */}
            <div
              className="p-4 pt-2 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => onHotelClick(hotel)}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1">{hotel.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{hotel.desc}</p>
              <div className="mt-3 text-blue-600 text-sm font-semibold">Lihat Detail →</div>
            </div>
          </div>
        ))}
        <div className="h-10"></div>
      </div>
    </div>
  );
}

// --- COMPONENT: DETAIL VIEW ---
function DetailView({ hotel, themeColor, onBack }) {
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <>
      <div className="bg-white min-h-full">
        {/* Header Image Slider (Tetap Sama) */}
        <div className="relative h-72">
          <ImageSlider
            images={hotel.images}
            heightClass="h-72"
            onClick={() => setShowPreview(true)}
          />

          <button
            onClick={onBack}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition z-20"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none z-20">
            {hotel.images.length} Foto
          </div>
        </div>

        {/* Hotel Info (Tetap Sama) */}
        <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
          <div className="flex items-start text-gray-500 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <p>{hotel.address}</p>
          </div>

          <div className="flex items-center space-x-4 mb-6 border-b pb-6">
            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 mr-1" />
              <span className="font-bold text-yellow-800">{hotel.rating}</span>
              <span className="text-yellow-700 text-xs ml-1">(200)</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Wifi className="w-4 h-4 mr-1" /> Free WiFi
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-4">Pilih Kamar</h2>

          {hotel.rooms && hotel.rooms.length > 0 ? (
            <div className="space-y-6">
              {hotel.rooms.map((room, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white"
                >
                  {/* --- NEW: ROOM IMAGE --- */}
                  <div className="relative h-40 w-full bg-gray-100">
                    <img
                      // Gunakan gambar kamar, jika tidak ada pakai gambar utama hotel sbg fallback
                      src={room.image || hotel.images[0]}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge Refundable diatas gambar (Opsional) */}
                    {room.refundable && (
                      <div className="absolute top-3 left-3 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center shadow-sm">
                        <CheckCircle className="w-3 h-3 mr-1" /> REFUNDABLE
                      </div>
                    )}
                  </div>

                  {/* --- ROOM DETAILS --- */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{room.name}</h3>
                    </div>

                    <div className="space-y-1.5 mb-4 border-b border-dashed pb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="w-5 flex justify-center mr-1">🛏️</span> {room.bed}
                      </div>
                      {room.breakfast && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="w-5 flex justify-center mr-1">🍽️</span> Include breakfast
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block">Harga per malam</span>
                        <span className="text-xl font-bold text-blue-900">Rp {room.price}</span>
                      </div>
                      <button className={`${themeColor} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95`}>
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              Informasi kamar belum tersedia untuk demo ini.
            </div>
          )}
        </div>
        <div className="h-10"></div>
      </div>

      {/* Preview Modal (Tetap Sama) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 z-50 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <ImageSlider images={hotel.images} heightClass="h-full" imageFit="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}

// --- COMPONENT: IMAGE SLIDER ---
function ImageSlider({ images, heightClass = "h-48", onClick, imageFit = "object-cover" }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sliderRef = React.useRef(null); // Ref untuk akses container slider

  // Logic scroll manual via tombol
  const scroll = (direction) => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;

      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Logic update dots saat di-swipe/scroll
  const handleScroll = (e) => {
    const slideWidth = e.target.offsetWidth;
    const scrollLeft = e.target.scrollLeft;
    const index = Math.round(scrollLeft / slideWidth);
    setActiveIndex(index);
  };

  return (
    <div className={`relative w-full ${heightClass} group`}>

      {/* --- TOMBOL PANAH KIRI --- */}
      {/* Hanya muncul jika bukan di slide pertama & jumlah gambar > 1 */}
      {images.length > 1 && activeIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Mencegah trigger onClick gambar (preview)
            scroll('left');
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm z-20 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
        // Note: opacity-0 group-hover:opacity-100 membuat panah hanya muncul saat mouse hover (di desktop). 
        // Hapus class itu jika ingin selalu muncul di HP.
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* --- TOMBOL PANAH KANAN --- */}
      {/* Hanya muncul jika bukan di slide terakhir & jumlah gambar > 1 */}
      {images.length > 1 && activeIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            scroll('right');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm z-20 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* --- SLIDER CONTAINER --- */}
      <div
        ref={sliderRef} // Pasang Ref disini
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="w-full h-full shrink-0 snap-center flex items-center justify-center bg-gray-100"
            onClick={onClick ? () => onClick(idx) : undefined}
          >
            <img
              src={img}
              alt={`Slide ${idx}`}
              className={`w-full h-full ${imageFit}`}
            />
          </div>
        ))}
      </div>

      {/* --- DOTS INDICATOR --- */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5 z-10 pointer-events-none">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay (Hanya mode cover) */}
      {imageFit === 'object-cover' && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent"></div>
      )}
    </div>
  );
}