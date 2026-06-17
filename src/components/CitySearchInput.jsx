import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Loader2, ChevronDown, X, Search } from 'lucide-react';
import { getCitySuggestions } from '../service/hotelService';

// ============================================================
// API CALL
// ============================================================
async function fetchCitySuggestions(query = '') {
  const data = await getCitySuggestions(query);
  if (data?.success) {
    let cities = data?.data || [];
    return cities;
  }
  return [];
}

// ============================================================
// MAIN EXPORT — CitySearchInput
// ============================================================
export default function CitySearchInput({ onSelect, onClick, placeholder = 'Select City', value }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(value || null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [searchQuery, setSearchQuery] = useState('');   

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);                  

  // Hit API saat first render
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCitySuggestions('')
      .then(data => {
        if (!cancelled) {
          setResults(data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || 'Terjadi kesalahan');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ✅ Auto-focus search input saat dropdown terbuka & reset saat tutup
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const updateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 99,
    });
  }, []);

  useEffect(() => {
    if (isOpen) updateDropdownPosition();
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutsideTrigger = triggerRef.current && !triggerRef.current.contains(e.target);
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(e.target);
      if (clickedOutsideTrigger && clickedOutsideDropdown) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    setSelectedCity(city);
    setIsOpen(false);
    onSelect?.(city);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedCity(null);
    onSelect?.(null);
  };

  // ✅ Filter results berdasarkan searchQuery (case-insensitive)
  const filteredResults = results.filter(item =>
    item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dropdownPortal = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={{ ...dropdownStyle, animation: 'dropdownIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* ✅ Search Input */}
          <div className="px-3 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 px-4 py-4 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading cities...
            </div>
          )}

          {error && (
            <div className="px-4 py-4 text-red-400 text-sm">⚠️ {error}</div>
          )}

          {!loading && !error && filteredResults.length === 0 && (
            <div className="px-4 py-4 text-gray-400 text-sm text-center">
              <div className="text-2xl mb-1">{searchQuery ? '🔍' : '🏙️'}</div>
              {searchQuery ? `No results for "${searchQuery}"` : 'No cities available'}
            </div>
          )}

          {!loading && !error && filteredResults.length > 0 && (
            <ul className="py-1 max-h-64 overflow-y-auto overscroll-contain">
              {filteredResults.map((item, idx) => (
                <li key={item?.geoId ?? idx}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group ${selectedCity?.geoId === item?.geoId ? 'bg-[#013440]/5' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#013440]/8 flex items-center justify-center shrink-0 group-hover:bg-[#013440]/15 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-[#013440]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {item?.name}
                      </div>
                    </div>
                    {selectedCity?.geoId === item?.geoId && (
                      <div className="w-2 h-2 rounded-full bg-[#013440] shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <style>{`
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.98); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={triggerRef} className="relative">
        {/* ✅ Trigger button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(prev => !prev);
            onClick?.();
          }}
          className="bg-white rounded-full p-1.5 shadow-lg flex items-center w-full"
        >
          {/* Icon */}
          <div className="bg-[#013440] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0">
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <MapPin className="w-5 h-5" />
            }
          </div>

          {/* Label */}
          <span className={`flex-1 ml-3 text-base font-medium text-left truncate ${selectedCity ? 'text-gray-700' : 'text-gray-400'}`}>
            {selectedCity?.name || placeholder}
          </span>

          {/* Clear button */}
          {selectedCity && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-1 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition shrink-0"
            >
              <X size={12} />
            </button>
          )}

          {/* Chevron */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 mr-2 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {dropdownPortal}
    </>
  );
}