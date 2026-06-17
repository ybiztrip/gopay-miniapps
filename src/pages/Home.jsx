import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { DATA } from '../data/data.js';
import DetailView from './DetailView.jsx';

// Components
import DateRangePicker from '../components/DateRangePicker';
import CitySearchInput from '../components/CitySearchInput';
import GuestRoomPicker from '../components/GuestRoomPicker';
import ImageSlider from '../components/ImageSlider';
import SplashScreen from '../components/SplashScreen.jsx';
import NotifSuccessBook from '../components/NotifSuccessBook.jsx';

// Hooks & Helpers
import { useHotels, useHotelDetail } from '../hooks/useHotel.js';
import currencyFormatter from '../helpers/currency.js';
import buildImageList from '../helpers/buildImageList.js';
import { callGetAuthCode } from '../helpers/gopayHelper.js';

// Services
import { getAuthorizationToken, getGopayProfile } from '../service/gopayService.js';

export default function Home() {
  const navigate = useNavigate();
  const [view, setView] = useState('home');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [dateRange, setDateRange] = useState({
    checkIn:  moment().startOf('day').toDate(),
    checkOut: moment().add(1, 'days').startOf('day').toDate(),
  });
  const [selectedCity, setSelectedCity]   = useState(null);
  const [guestRoom, setGuestRoom]         = useState({ rooms: 1, guests: 2 });

  const [page, setPage]           = useState(1);
  const [allHotels, setAllHotels] = useState([]);
  const [hasMore, setHasMore]     = useState(true);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [bookedHotelName, setBookedHotelName]   = useState('');

  // ─── State Seamless Login GoPay ───
  const [gopayAuthCode,      setGopayAuthCode]      = useState(null);
  const [gopayTokenLoading,  setGopayTokenLoading]  = useState(false);

  const isLoadMoreRef = useRef(false);
  const filterRef     = useRef({ guestRoom, dateRange, selectedCity });

  useEffect(() => {
    filterRef.current = { guestRoom, dateRange, selectedCity };
  }, [guestRoom, dateRange, selectedCity]);

  const currentData = DATA[import.meta.env.VITE_ACTIVE_ENV] || DATA['este'];

  const { hotels, search, loading: isSearching }        = useHotels();
  const { rooms, fetchDetail, loading: isLoadingRooms } = useHotelDetail();

  // ─── STEP 1: Get Authorization Code (prod only) ───
  useEffect(() => {
    const isProd = import.meta.env.VITE_ACTIVE_ENV === 'production';
    if (!isProd) {
      console.log('[GoPay] Skip getAuthCode — bukan environment production');
      return;
    }

    callGetAuthCode({
      onSuccess: (response) => {
        setGopayAuthCode(response?.data?.authCode ?? response?.authCode ?? response);
      },
      onError: (error) => {
        console.warn('[GoPay] getAuthCode onError:', error);
      },
    });
  }, []);

  // ─── STEP 2: Get Authorization Token (prod only) ───
  useEffect(() => {
    const isProd = import.meta.env.VITE_ACTIVE_ENV === 'production';
    if (!isProd || !gopayAuthCode) return;

    setGopayTokenLoading(true);

    getAuthorizationToken(gopayAuthCode)
      .then((data) => {
        console.log('[GoPay] Authorization Token berhasil:', data);
        // ─── STEP 3: Get GoPay Profile (prod only) ───
        return getGopayProfile(data?.auth_token);
      })
      .catch((err) => {
        console.error('[GoPay] Get Authorization Token gagal:', err.message);
      })
      .finally(() => {
        setGopayTokenLoading(false);
      });
  }, [gopayAuthCode]);

  const buildSearchPayload = useCallback((currentPage = 1) => {
    const { guestRoom, dateRange, selectedCity } = filterRef.current;
    const base = {
      geoId: '102813',
      area: 'Jakarta',
      language: 'en',
      userNationality: 'ID',
      numRooms: guestRoom.rooms,
      numAdults: guestRoom.guests,
      numChildrens: 0,
      displayCurrency: 'IDR',
      isExtended: true,
      page: currentPage,
      limit: 10,
      appType: import.meta.env.VITE_APP_TYPE || 'v2',
      filters: {
        starRating: [true, true, true, true, true],
        priceRange: { min: 0, max: 3200000 },
      },
      checkInDate: moment(dateRange.checkIn).format('YYYY-MM-DD'),
      checkOutDate: moment(dateRange.checkOut).format('YYYY-MM-DD'),
    };

    if (selectedCity) {
      return { ...base, geoId: selectedCity?.geoId, area: selectedCity?.name };
    }

    return base;
  }, []);

  useEffect(() => {
    search(buildSearchPayload(1));
  }, []);

  useEffect(() => {
    if (!hotels) return;

    if (isLoadMoreRef.current) {
      setAllHotels(prev => [...prev, ...hotels]);
    } else {
      setAllHotels(hotels);
    }

    if (hotels.length < 10) {
      setHasMore(false);
    }
  }, [hotels]);

  const handleHotelClick = async (hotel) => {
    setSelectedHotel(hotel);
    setView('detail');

    const { dateRange, guestRoom } = filterRef.current;
    const payload = {
      propertyId: hotel?.propertyId,
      checkInDate: moment(dateRange.checkIn).format('YYYY-MM-DD'),
      checkOutDate: moment(dateRange.checkOut).format('YYYY-MM-DD'),
      numRooms: guestRoom.rooms,
      numAdults: guestRoom.guests,
      numChildrens: 0,
      displayCurrency: 'IDR',
      userNationality: 'ID',
      language: 'en',
      isExtended: true,
    };

    await fetchDetail(payload);
  };

  const handleDateRangeConfirm = ({ checkIn, checkOut }) => {
    setDateRange({ checkIn, checkOut });
  };

  const handleSearch = () => {
    isLoadMoreRef.current = false;
    setPage(1);
    setAllHotels([]);
    setHasMore(true);
    search(buildSearchPayload(1));
  };

  const handleLoadMore = () => {
    if (isSearching) return;
    const nextPage = page + 1;
    isLoadMoreRef.current = true;
    setPage(nextPage);
    search(buildSearchPayload(nextPage));
  };

  const handleBack = () => {
    setView('home');
    setSelectedHotel(null);
  };

  const handleBookingSuccess = () => {
    const hotelName = selectedHotel?.propertySummary?.name || '';
    setView('home');
    setBookedHotelName(hotelName);
    setShowSuccessPopup(true);
    setSelectedHotel(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-md h-screen bg-white shadow-2xl overflow-hidden flex flex-col relative">
        {isSearching ? (
          <SplashScreen data={currentData} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {view === 'home' ? (
              <HomeView
                data={currentData}
                hotelList={allHotels ?? []}
                isSearching={isSearching}
                onHotelClick={handleHotelClick}
                onDateRangeConfirm={handleDateRangeConfirm}
                onSelectCity={(city) => setSelectedCity(city)}
                onSelectGuestRoom={({ rooms, guests }) => setGuestRoom({ rooms, guests })}
                handleSearch={handleSearch}
                hasMore={hasMore}
                isLoadingMore={isSearching && page > 1}
                onLoadMore={handleLoadMore}
                selectedCity={selectedCity}
                dateRange={dateRange}
                guestRoom={guestRoom}
                onNavigateHistory={() => navigate('/transactions')}
              />
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <DetailView
                  hotel={selectedHotel}
                  themeColor={currentData.themeColor}
                  onBack={handleBack}
                  rooms={rooms ?? []}
                  isLoadingRooms={isLoadingRooms}
                  dateRange={dateRange}
                  onSuccess={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      handleBookingSuccess();
                    }, 500);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <NotifSuccessBook
        visible={showSuccessPopup}
        hotelName={bookedHotelName}
        onClose={() => setShowSuccessPopup(false)}
      />
    </div>
  );
}

function HomeView({ data, hotelList, isSearching, onHotelClick, onDateRangeConfirm, onSelectCity, onSelectGuestRoom, handleSearch, hasMore, isLoadingMore, onLoadMore, selectedCity, dateRange, guestRoom, onNavigateHistory }) {
  const accentColor = 'bg-[#013440]';
  return (
    <div className="flex flex-col h-full">
      <div className={`flex-shrink-0 relative ${data?.themeColor} z-[100]`}>
        <div className="px-6 pt-16 pb-4">
          {/* ─── Header Row: Logo + Tagline + History Button ─── */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center">
              <div className="bg-white rounded-full p-2 mr-3 shadow-lg">
                <div className="w-10 h-10 flex items-center justify-center">
                  <span className="text-3xl">🛏️</span>
                </div>
              </div>
              <h1 className="text-xl font-serif text-white font-bold leading-none tracking-wide">
                {data.tagline}
              </h1>
            </div>

            {/* History Icon Button */}
            <button
              onClick={onNavigateHistory}
              className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-all active:scale-95 shadow-lg"
              title="Transaction History"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* ─── Filter Dropdowns ─── */}
        <div className={`relative ${data?.themeColor} pt-4`}>
          <div className="px-6 pb-8">
            <div className="space-y-3">
              <CitySearchInput onSelect={(city) => onSelectCity(city)} value={selectedCity} />
              <div className="flex space-x-2">
                <DateRangePicker onConfirm={({ checkIn, checkOut }) => onDateRangeConfirm({ checkIn, checkOut })} value={dateRange} />
                <GuestRoomPicker onConfirm={({ rooms, guests }) => onSelectGuestRoom({ rooms, guests })} value={guestRoom} />
              </div>
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={`${accentColor} px-16 py-2 text-white font-bold rounded-full shadow-xl hover:opacity-90 transition-transform active:scale-95 text-lg disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Hotel List ─── */}
        <div className="bg-gray-100">
          <div className="pt-4 relative z-20 px-4 space-y-5 pb-10">
            {isSearching ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : hotelList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🏨</p>
                <p className="font-medium">No hotels found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            ) : (
              hotelList.map((hotel) => {
                const imageList = buildImageList(hotel?.propertyImages);
                return (
                  <div key={hotel?.propertyId} className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform">
                    <ImageSlider images={imageList} heightClass="h-48" />
                    <div className="relative -mt-10 mb-10 mr-3 float-right z-30" onClick={() => onHotelClick(hotel)}>
                      <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm cursor-pointer">
                        {currencyFormatter(
                          Number(hotel?.cheapestRoom?.chargeableRate?.total),
                          hotel?.cheapestRoom?.chargeableRate?.currencyCode
                        )}
                      </div>
                    </div>
                    <div className="p-4 pt-2 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => onHotelClick(hotel)}>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{hotel?.propertySummary?.name}</h3>
                      <div className="mt-3 text-blue-600 text-sm font-semibold">See Detail →</div>
                    </div>
                  </div>
                );
              })
            )}
            <div className="h-10"></div>
          </div>

          {!isSearching && hasMore && hotelList.length > 0 && (
            <div className="flex justify-center mb-10">
              <button
                onClick={onLoadMore}
                className={`${accentColor} px-6 py-2 text-white font-bold rounded-full shadow-xl hover:opacity-90 transition-transform active:scale-95 text-sm`}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}