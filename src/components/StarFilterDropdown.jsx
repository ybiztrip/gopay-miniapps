import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, ChevronDown, X } from 'lucide-react';

const ALL_STARS = [1, 2, 3, 4, 5];

export default function StarFilterDropdown({ onConfirm, accentColor = "bg-[#013440]", value }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(new Set(value?.length ? value : ALL_STARS));
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value?.length) {
      setSelectedStars(new Set(value));
    }
  }, [value]);

  const updatePosition = () => {
    if (buttonRef.current && dropdownRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${rect.bottom + 8}px`;
      dropdownRef.current.style.left = `${rect.left}px`;
      dropdownRef.current.style.width = `${rect.width}px`;
    }
  };

  const openDropdown = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      updatePosition();
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

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

  const hasFilter = selectedStars.size > 0;

  const toggleStar = (star) => {
    const updated = new Set(selectedStars);
    if (updated.has(star)) {
      updated.delete(star);
    } else {
      updated.add(star);
    }
    setSelectedStars(updated);
    onConfirm([...updated].sort((a, b) => a - b)); // kirim array number, e.g. [1, 3, 5]
  };

  const resetFilter = (e) => {
    e.stopPropagation();
    setSelectedStars(new Set());
    onConfirm([]); // kosong = tidak ada filter bintang
    setIsOpen(false);
  };

  const labelText = hasFilter
    ? [...selectedStars].sort((a, b) => a - b).map((s) => `${s}★`).join(', ')
    : 'Star Rating';

  return (
    <>
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

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: 0, left: 0, width: 200 }} // nilai awal, langsung ditimpa updatePosition
          className="fixed bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-[99999]"
        >
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 px-1">
            Star Filter
          </p>
          <div className="space-y-1">
            {ALL_STARS.map((star) => {
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