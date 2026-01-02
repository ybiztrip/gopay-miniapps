import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight
} from 'lucide-react';

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

export default ImageSlider;
