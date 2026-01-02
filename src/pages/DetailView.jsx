import React, { useState } from 'react';
import {
  ArrowLeft, Star, MapPin, Wifi, CheckCircle, X,
  ChevronRight, ChevronDown, ChevronUp,
  XCircle,
} from 'lucide-react';
import ImageSlider from '../components/ImageSlider.jsx';

function DetailView({ hotel, themeColor, onBack }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // STATE BARU: Untuk menyimpan gambar mana yang akan ditampilkan di modal
  const [previewImages, setPreviewImages] = useState([]);

  // HELPER: Handle buka preview
  const handlePreview = (images) => {
    setPreviewImages(images); // Set gambar yang mau dilihat
    setShowPreview(true);     // Buka modal
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      const isFilled = index < Math.floor(rating);
      return (
        <Star
          key={index}
          className={`w-5 h-5 ${isFilled ? "text-[#FF9F43] fill-[#FF9F43]" : "text-gray-300 fill-gray-300"}`}
        />
      );
    });
  };

  return (
    <>
      <div className="bg-white min-h-full">
        {/* Header Image Slider */}
        <div className="relative h-72">
          <ImageSlider
            images={hotel.images}
            heightClass="h-72"
            // Update onClick: Kirim album hotel ke preview
            onClick={() => handlePreview(hotel.images)}
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

        {/* Hotel Info */}
        <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
          <div className="flex items-start text-gray-500 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <p>{hotel.address}</p>
          </div>

          {/* Rating & See More */}
          <div className="mb-6 border-b border-gray-100 pb-6">
            <div className="flex items-end justify-between">
              <div className="flex flex-col space-y-1">
                <div className="flex space-x-1">{renderStars(hotel.rating)}</div>
                <div className="text-gray-500 text-base font-medium">
                  <span className="text-gray-800 font-semibold">{hotel.rating}</span> Rating (200)
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-gray-500 text-sm font-medium hover:text-gray-900 transition-colors border-none outline-none focus:outline-none bg-transparent mb-1"
              >
                See More
                {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-3">
                <p>Nikmati pengalaman menginap terbaik dengan pemandangan estetik.</p>
                <div className="grid grid-cols-2 gap-2 font-medium text-gray-700">
                  <div className="flex items-center"><Wifi className="w-4 h-4 mr-2 text-blue-500" /> Free WiFi</div>
                  <div className="flex items-center"><span className="mr-2">❄️</span> AC Dingin</div>
                </div>
              </div>
            </div>
          </div>

          {/* --- ROOM LIST --- */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">Pilih Kamar</h2>

          {hotel.rooms && hotel.rooms.length > 0 ? (
            <div className="space-y-4">
              {hotel.rooms.map((room, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-row h-auto min-h-[140px]"
                >
                  {/* LEFT: Room Image (Slider) */}
                  <div className="w-[35%] relative bg-gray-200 shrink-0 cursor-pointer group">

                    {/* Wrapper Absolute agar Slider mengisi penuh area kiri */}
                    <div className="absolute inset-0">
                      <ImageSlider
                        // FIX 1: Gunakan Array. 
                        // Disini saya menggabungkan room.images (jika ada) dengan hotel.images 
                        // agar slider bisa digeser jika foto lebih dari satu.
                        images={room.images ? room.images : hotel.images}

                        // FIX 2: Gunakan h-full agar mengikuti tinggi kartu
                        heightClass="h-full"

                        // Enable Preview saat diklik
                        onClick={() => handlePreview(room.images ? room.images : hotel.images)}
                      />
                    </div>

                  </div>

                  {/* RIGHT: Room Details */}
                  <div className="flex-1 p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-tight mb-2">{room.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600 text-xs">
                          <span className="w-4 flex justify-center mr-1">🛏️</span> {room.bed}
                        </div>
                        {room.breakfast && (
                          <div className="flex items-center text-gray-600 text-xs">
                            <span className="w-4 flex justify-center mr-1">🍽️</span> Include breakfast
                          </div>
                        )}
                        {room.refundable ? 
                          <div className="flex items-center text-gray-600 text-xs">
                            <span className="w-4 flex justify-center mr-1"><CheckCircle className="w-3 h-3 text-green-500" /></span>
                            <span className="text-green-600 font-medium">Refundable</span>
                          </div>
                          :
                          <div className="flex items-center text-gray-600 text-xs">
                            <span className="w-4 flex justify-center mr-1"><XCircle className="w-3 h-3 text-red-500" /></span>
                            <span className="text-green-600 font-medium">Non Refundable</span>
                          </div>
                        }
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-end mb-1">
                        <span className="text-blue-600 text-xs font-semibold cursor-pointer hover:underline flex items-center">
                          Detail <ChevronRight className="w-3 h-3 ml-0.5" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-medium">Harga per malam</span>
                          <span className="text-[#2A3B5F] font-bold text-lg leading-none">
                            {room.price}
                          </span>
                        </div>
                        <button className="bg-[#2A3B5F] text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                          Book
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              Informasi kamar belum tersedia.
            </div>
          )}
        </div>
        <div className="h-10"></div>
      </div>

      {/* --- PREVIEW MODAL (UPDATED: BLUR BACKDROP) --- */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">

          {/* 1. BACKDROP: Layer Hitam Transparan + Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowPreview(false)} // Klik area luar untuk tutup
          ></div>

          {/* 2. MODAL CARD: Kotak di tengah */}
          <div className="relative w-full max-w-xs bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 z-10 border border-white/10">

            {/* Tombol Close (X) */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-20 bg-black/40 text-white p-1.5 rounded-full hover:bg-black/60 backdrop-blur-md border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slider di dalam Modal */}
            {/* Aspect Ratio [4/5] agar bentuknya potrait pas di HP */}
            <div className="aspect-[4/5] w-full bg-neutral-900">
              <ImageSlider
                images={previewImages}
                heightClass="h-full"
                imageFit="object-contain" // Agar gambar tidak terpotong (fit to screen)
              />
            </div>

            {/* Caption Bawah */}
            <div className="bg-neutral-900 p-3 text-center text-white/60 text-xs border-t border-white/5">
              {previewImages.length} Foto tersedia
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default DetailView;