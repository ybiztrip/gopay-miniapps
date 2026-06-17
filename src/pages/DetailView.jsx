import { useState } from 'react';
import { ArrowLeft, Star, MapPin, CheckCircle, X } from 'lucide-react';
import moment from 'moment';

// Components
import ImageSlider from '../components/ImageSlider.jsx';
import GuestFormView from '../components/GuestForm.jsx';

// Helpers
import currencyFormatter from '../helpers/currency.js';
import buildImageList from '../helpers/buildImageList.js';
import getFacilityHighlights from '../helpers/getFacilityHighlights.js';

export default function DetailView({ hotel, themeColor, onBack, rooms = [], isLoadingRooms = false, dateRange, onSuccess }) {
  const [showPreview, setShowPreview] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);

  // ─── State GoPay Profile ───
  const gopayProfile = JSON.parse(localStorage.getItem('gopayProfile'));

  const mainImages        = buildImageList(hotel?.propertyImages);
  const facilityHighlights = getFacilityHighlights(rooms?.[0]?.propertyFacilities ?? []);

  // ─── Handler: user klik "Choose" pada room ───
  const handleChooseRoom = async (room) => {
    setBookingRoom(room);
  };

  // Jika ada room yang dipilih, tampilkan GuestFormView sebagai layar penuh
  if (bookingRoom) {
    return (
      <GuestFormView
        room={bookingRoom}
        hotel={hotel}
        themeColor={themeColor}
        checkIn={dateRange?.checkIn && moment(dateRange.checkIn).format('YYYY-MM-DD')}
        checkOut={dateRange?.checkOut && moment(dateRange.checkOut).format('YYYY-MM-DD')}
        gopayProfile={gopayProfile}          // ✅ pass profile ke GuestForm untuk pre-fill data
        onBack={() => setBookingRoom(null)}
        onProceedPayment={() => {
          console.log('Proceed to payment');
          setBookingRoom(null);
          onSuccess?.();
        }}
      />
    );
  }

  return (
    <>
      <div className="bg-white min-h-full">
        {/* Header Image Slider */}
        <div className="relative h-72">
          <ImageSlider
            images={mainImages}
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
            {mainImages?.length ?? 0} Photos
          </div>
        </div>

        {/* Hotel Info */}
        <div className="px-5 py-6 -mt-6 bg-white rounded-t-3xl relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{hotel?.propertySummary?.name}</h1>
          <div className="flex items-start text-gray-500 text-sm mb-4">
            <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <p>
              {hotel?.propertySummary?.address?.lines?.join(', ')},{' '}
              {hotel?.propertySummary?.address?.city}
            </p>
          </div>

          {/* Rating + Facility Highlights */}
          <div className="mb-6 border-b pb-5 space-y-3">
            <div className="flex items-center">
              <div className="flex items-center bg-yellow-100 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 mr-1" />
                <span className="font-bold text-yellow-800">{hotel?.propertySummary?.starRating}</span>
              </div>
            </div>
            {facilityHighlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {facilityHighlights.map((facility, idx) => {
                  const Icon = facility.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-full border border-blue-100"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {facility.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-4">Select Room</h2>

          {/* Loading State */}
          {isLoadingRooms ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading room list...</p>
            </div>
          ) : rooms.length > 0 ? (
            <div className="space-y-6">
              {rooms.map((room, index) => {
                const roomLargeImages = (room?.roomImages ?? [])
                  .flatMap((imgGroup) => imgGroup?.entries ?? [])
                  .filter((entry) => entry?.imageType === 'LARGE')
                  .map((entry) => ({ url: entry?.url }));

                const bedArrangement =
                  room?.bedArrangement?.[0]?.bedroomLayouts?.[0]?.arrangements ?? [];
                const bedText = bedArrangement
                  .map((a) => {
                    const label = a.bedType
                      .replace('KINGBED', 'King Bed')
                      .replace('QUEENBED', 'Queen Bed')
                      .replace('TWINBED', 'Twin Bed')
                      .replace('DOUBLEBED', 'Double Bed')
                      .replace('SINGLEBED', 'Single Bed');
                    return `${a.total}x ${label}`;
                  })
                  .join(', ');

                const nightlyPrice = room?.nightlyRates?.displaySellAmount;
                const currency     = room?.nightlyRates?.displayCurrency;
                const taxCharge    = room?.charges?.find((c) => c.type === 'TAX');

                return (
                  <div
                    key={`${room?.roomId ?? 'room'}-${index}`}
                    className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white"
                  >
                    {/* Room Image Slider */}
                    <div className="relative h-44 w-full bg-gray-100">
                      {roomLargeImages.length > 0 ? (
                        <>
                          <ImageSlider images={roomLargeImages} heightClass="h-44" />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none z-20">
                            {roomLargeImages.length} Photos
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                          No Image
                        </div>
                      )}
                      {room?.isRefundable && (
                        <div className="absolute top-3 left-3 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm flex items-center shadow-sm z-20">
                          <CheckCircle className="w-3 h-3 mr-1" /> REFUNDABLE
                        </div>
                      )}
                      {room?.breakfastIncluded && (
                        <div className="absolute top-3 right-3 bg-orange-400/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm shadow-sm z-20">
                          Breakfast
                        </div>
                      )}
                    </div>

                    {/* Room Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-base leading-tight mb-2">
                        {room?.roomName}
                      </h3>
                      <div className="space-y-1.5 mb-4 border-b border-dashed pb-4">
                        {bedText && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="w-5 flex justify-center mr-1">🛏️</span>
                            {bedText}
                          </div>
                        )}
                        {room?.breakfastIncluded && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="w-5 flex justify-center mr-1">🍽️</span>
                            Include breakfast
                          </div>
                        )}
                        {room?.maxOccupancy && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <span className="w-5 flex justify-center mr-1">👥</span>
                            Max {room.maxOccupancy} guests
                          </div>
                        )}
                        {room?.cancellationPolicy?.displayText && (
                          <div className="flex items-start text-gray-500 text-xs mt-1">
                            <span className="w-5 flex justify-center mr-1 mt-0.5">📋</span>
                            <span className="line-clamp-2">{room.cancellationPolicy.displayText}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-400 block">Price per night</span>
                          <span className="text-xl font-bold text-blue-900">
                            {currencyFormatter(nightlyPrice, currency)}
                          </span>
                          {taxCharge && (
                            <span className="text-xs text-gray-400 block">
                              + {currencyFormatter(taxCharge.displayAmount, taxCharge.displayCurrency)} tax
                            </span>
                          )}
                        </div>

                        {/* ✅ Choose button — sekarang pakai handleChooseRoom */}
                        <button
                          onClick={() => handleChooseRoom(room)}
                          className={`${themeColor} text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2`}
                        >
                          Choose
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
              Room information is not available.
            </div>
          )}
        </div>
        <div className="h-10"></div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 z-50 bg-white/20 p-2 rounded-full text-white hover:bg-white/40 backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <ImageSlider images={mainImages} heightClass="h-full" imageFit="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}