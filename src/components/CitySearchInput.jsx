import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { getCitySuggestions } from '../service/hotelService';

// ============================================================
// UTILS
// ============================================================

/**
 * Debounce hook — delay eksekusi fn sampai user berhenti ketik
 */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * Highlight bagian teks yang cocok dengan query
 */
function HighlightMatch({ text, query }) {
  if (!query) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-transparent text-[#013440] font-bold not-italic">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ============================================================
// API CALL — ganti URL dengan endpoint real kamu
// ============================================================

/**
 * Hit API pencarian kota.
 * Saat API belum siap, fungsi ini mock data dulu.
 * Tinggal ganti isi fetch() dengan endpoint real.
 */
async function fetchCitySuggestions(query) {
  const data = await getCitySuggestions(query);
  if (data?.success) {
    let cities = data?.data || [];
    if (cities?.length > 0) {
      cities = cities?.filter(city => city?.type === 'CITY') || [];
    }
    return cities;
  }
}

// ============================================================
// DROPDOWN PORTAL — render ke body agar bebas dari overflow clip
// ============================================================
function CityDropdown({ inputRef, results, query, loading, error, onSelect, onClose }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  // Hitung posisi dropdown berdasarkan posisi input di viewport
  useEffect(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [inputRef]);

  // Recalculate saat window resize atau scroll
  useEffect(() => {
    const update = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [inputRef]);

  const content = (() => {
    if (loading) return (
      <div className="flex items-center gap-2 px-4 py-4 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Search city...
      </div>
    );
    if (error) return (
      <div className="px-4 py-4 text-red-400 text-sm">⚠️ {error}</div>
    );
    if (results.length === 0) return (
      <div className="px-4 py-4 text-gray-400 text-sm text-center">
        <div className="text-2xl mb-1">🔍</div>
        "<span className="font-semibold text-gray-600">{query}</span>" City not found
      </div>
    );
    return (
      <ul className="py-1 max-h-64 overflow-y-auto overscroll-contain">
        {results.map((item, idx) => (
          <li key={item?.geoId ?? idx}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-full bg-[#013440]/8 flex items-center justify-center shrink-0 group-hover:bg-[#013440]/15 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-[#013440]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  <HighlightMatch text={item?.name} query={query} />
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    );
  })();

  return createPortal(
    <>
      {/* Invisible backdrop untuk close saat klik luar */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      <div
        className="absolute z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          animation: 'dropdownIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {content}
        <style>{`
          @keyframes dropdownIn {
            from { opacity: 0; transform: translateY(-6px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </>,
    document.body
  );
}

// ============================================================
// MAIN EXPORT — CitySearchInput
// Pemakaian di HomeView:
//   <CitySearchInput onSelect={(city) => setSelectedCity(city)} />
// ============================================================
export default function CitySearchInput({ onSelect, onClick }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 400);

  // Hit API setiap kali debounced query berubah
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    // Minimal 2 karakter baru fetch
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setIsOpen(true);

    fetchCitySuggestions(trimmed)
      .then(data => {
        if (!cancelled) {
          setResults(data);
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
  }, [debouncedQuery]);

  const handleSelect = (city) => {
    setQuery(city?.name);
    setIsOpen(false);
    onSelect?.(city);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelect?.(null);
    inputRef.current?.focus();
  };

  return (
    <div ref={inputRef} className="bg-white rounded-full p-1.5 shadow-lg flex items-center relative">
      {/* Icon button */}
      <div className="bg-[#013440] w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0">
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Search className="w-5 h-5" />
        }
      </div>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
        }}
        onFocus={() => {
          // Buka lagi dropdown jika sudah ada hasil sebelumnya
          if (results.length > 0 && query.trim().length >= 2) setIsOpen(true);
        }}
        onClick={onClick}
        placeholder="Select City"
        className="flex-1 ml-3 outline-none text-gray-700 font-medium placeholder:text-gray-400 bg-transparent text-base"
        autoComplete="off"
        spellCheck={false}
      />

      {/* Clear button — muncul saat ada teks */}
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="mr-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition shrink-0"
        >
          <X size={12} />
        </button>
      )}

      {/* Dropdown via Portal */}
      {isOpen && (
        <CityDropdown
          inputRef={inputRef}
          results={results}
          query={debouncedQuery.trim()}
          loading={loading}
          error={error}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}