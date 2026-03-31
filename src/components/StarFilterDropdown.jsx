import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, ChevronDown, X } from 'lucide-react';

const toBoolArray = (starsSet) =>
  [1, 2, 3, 4, 5].map((s) => starsSet.has(s));

// Default: semua bintang terpilih
const ALL_STARS = new Set([1, 2, 3, 4, 5]);

export default function StarFilterDropdown({ onConfirm, accentColor = "bg-[#013440]" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(new Set(ALL_STARS)); // default semua true
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Kirim default value ke parent saat pertama kali render
  useEffect(() => {
    onConfirm(toBoolArray(new Set(ALL_STARS)));
  }, []);

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const starOptions = [1, 2, 3, 4, 5];

  // hasFilter = true jika pilihan BUKAN semua terpilih (ada yang di-unselect)
  const hasFilter = selectedStars.size < 5;

  const toggleStar = (star) => {
    const updated = new Set(selectedStars);
    if (updated.has(star)) {
      updated.delete(star);
    } else {
      updated.add(star);
    }
    setSelectedStars(updated);
    onConfirm(toBoolArray(updated));
  };

  // Reset = kembalikan ke semua terpilih
  const resetFilter = (e) => {
    e.stopPropagation();
    const full = new Set(ALL_STARS);
    setSelectedStars(full);
    onConfirm(toBoolArray(full)); // [true, true, true, true, true]
    setIsOpen(false);
  };

  const labelText = hasFilter
    ? [...selectedStars].sort((a, b) => a - b).map((s) => `${s}★`).join(', ')
    : 'Star Rating';

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => isOpen ? setIsOpen(false) : openDropdown()}
        className={`flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg text-sm font-semibold transition-all w-full
          ${hasFilter ? 'text-yellow-700 border-2 border-yellow-400' : 'text-gray-600'}
          hover:shadow-xl active:scale-95`}
      >
        <Star className={`w-4 h-4 shrink-0 ${hasFilter ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        <span className="flex-1 text-left truncate">{labelText}</span>
        {hasFilter ? (
          <X
            className="w-3.5 h-3.5 shrink-0 text-gray-400 hover:text-red-500 transition-colors"
            onClick={resetFilter}
          />
        ) : (
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown Panel via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: dropdownPos.top, left: dropdownPos.left, minWidth: 200 }}
          className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-[99999]"
        >
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
            Star Filter
          </p>
          <div className="space-y-1">
            {starOptions.map((star) => {
              const isSelected = selectedStars.has(star);
              return (
                <button
                  key={star}
                  onClick={() => toggleStar(star)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm font-medium
                    ${isSelected
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-300'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                      />
                    ))}
                  </span>
                  <span>Star {star}</span>
                  {isSelected && <span className="ml-auto text-yellow-500 font-bold text-sm">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Tombol reset muncul hanya jika ada yang di-unselect */}
          {hasFilter && (
            <button
              onClick={resetFilter}
              className="mt-2 w-full text-center text-xs text-red-400 hover:text-red-600 font-semibold py-1.5 border-t border-gray-100 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}