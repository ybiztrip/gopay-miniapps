import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Globe, ChevronDown } from 'lucide-react';
import moment from 'moment';

// Components
import InputField from './InputField.jsx';
import BookingModal from './BookingModal.jsx';

// Helpers
import inputClass from '../helpers/inputClass.js';
import selectClass from '../helpers/selectClass.js';
import currencyFormatter from '../helpers/currency.js';
import { parseGopayPhone } from '../helpers/gopayHelper.js';

const GENDERS = ['Male', 'Female'];

const PHONE_CODES = [
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+1',  country: 'USA',       flag: '🇺🇸' },
  { code: '+44', country: 'UK',        flag: '🇬🇧' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia',  flag: '🇲🇾' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan',     flag: '🇯🇵' },
  { code: '+82', country: 'Korea',     flag: '🇰🇷' },
  { code: '+86', country: 'China',     flag: '🇨🇳' },
  { code: '+91', country: 'India',     flag: '🇮🇳' },
];

// Daftar nationality (bisa diperluas)
const NATIONALITIES = [
  'Indonesian', 'American', 'British', 'Singaporean', 'Malaysian',
  'Australian', 'Japanese', 'Korean', 'Chinese', 'Indian', 'Other',
];

function validate(form) {
  const errors = {};
  if (!form.contactEmail.trim()) errors.contactEmail = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
    errors.contactEmail = 'Invalid email format';
  if (!form.contactFirstName.trim()) errors.contactFirstName = 'First name is required';
  if (!form.contactLastName.trim()) errors.contactLastName = 'Last name is required';
  if (!form.contactNationality) errors.contactNationality = 'Nationality is required';
  if (!form.contactPhoneNumber.trim()) errors.contactPhoneNumber = 'Phone number is required';
  else if (!/^\d{6,15}$/.test(form.contactPhoneNumber))
    errors.contactPhoneNumber = 'Enter a valid phone number (digits only)';
  if (!form.contactGender) errors.contactGender = 'Gender is required'
  return errors;
}

export default function GuestForm({
  room,
  hotel,
  themeColor,
  checkIn,
  checkOut,
  onBack,
  onProceedPayment,
  gopayProfile,      // ✅ dari getGopayProfile — untuk pre-fill form
}) {
  const [form, setForm] = useState({
    contactEmail:       '',
    contactFirstName:   '',
    contactLastName:    '',
    contactNationality: '',
    contactPhoneCode:   '+62',
    contactPhoneNumber: '',
    contactGender:      '',
  });
  const [errors, setErrors]               = useState({});
  const [touched, setTouched]             = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);

  // ─── Pre-fill form dari GoPay profile ───
  // Dijalankan 1x saat gopayProfile tersedia
  useEffect(() => {
    if (!gopayProfile) return;

    const { code, number }        = parseGopayPhone(gopayProfile?.phone_number);

    setForm((prev) => ({
      ...prev,
      // Hanya pre-fill jika field masih kosong — tidak overwrite input user
      contactFirstName:   gopayProfile?.username ? gopayProfile?.username : prev.contactFirstName,
      contactLastName:    gopayProfile?.username ? "" : prev.contactLastName,
      contactEmail:       gopayProfile?.email ? gopayProfile?.email : prev.contactEmail,
      contactPhoneCode:   prev.contactPhoneCode    || code,
      contactPhoneNumber: prev.contactPhoneNumber  || number,
      // Nationality default Indonesian jika profile dari GoPay (umumnya WNI)
      contactNationality: prev.contactNationality  || 'Indonesian',
    }));

    console.log('[GoPay] Form pre-filled dari profile:', gopayProfile);
  }, [gopayProfile]);

  const nights =
    checkIn && checkOut ? moment(checkOut).diff(moment(checkIn), 'days') : 1;

  const nightlyPrice = room?.nightlyRates?.displaySellAmount ?? 0;
  const currency     = room?.nightlyRates?.displayCurrency ?? 'IDR';
  const taxCharge    = room?.charges?.find((c) => c.type === 'TAX');
  const basePrice    = nightlyPrice * nights;
  const payAtProperty = 0; // Asumsi tidak ada biaya di muka (default Pay at Property)
  const totalPrice   = basePrice + (taxCharge ? taxCharge?.displayAmount * nights : 0) + payAtProperty;
  const payNowPrice   = basePrice + (taxCharge ? taxCharge?.displayAmount * nights : 0);

  const bedArrangement =
    room?.bedArrangement?.[0]?.bedroomLayouts?.[0]?.arrangements ?? [];
  const bedText = bedArrangement
    .map((a) => {
      const label = a.bedType
        .replace('KINGBED',   'King Bed')
        .replace('QUEENBED',  'Queen Bed')
        .replace('TWINBED',   'Twin Bed')
        .replace('DOUBLEBED', 'Double Bed')
        .replace('SINGLEBED', 'Single Bed');
      return `${a.total}x ${label}`;
    })
    .join(', ');

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const newErrors = validate({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const newErrors = validate(form);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  }

  function handleSubmit() {
    const allTouched = Object.fromEntries(Object.keys(form).map((k) => [k, true]));
    setTouched(allTouched);
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setShowBookingModal(true);
    }
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Top bar */}
      <div className="bg-white border-b px-5 py-4 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => onBack?.()}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">Guest Details</h1>
          <p className="text-xs text-gray-500">Fill in your information to continue</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 lg:grid lg:grid-cols-5 lg:gap-6 flex flex-col gap-6">
        {/* ─── LEFT: Guest Form ─── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              Guest Information
            </h2>
            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" required icon={User} error={errors.contactFirstName}>
                <input
                  type="text"
                  placeholder="John"
                  value={form.contactFirstName}
                  onChange={(e) => handleChange('contactFirstName', e.target.value)}
                  onBlur={() => handleBlur('contactFirstName')}
                  className={inputClass(true, !!errors.contactFirstName)}
                  disabled={gopayProfile?.username}
                />
              </InputField>
              {
                !gopayProfile?.username && (
                  <InputField label="Last Name" required icon={User} error={errors.contactLastName}>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={form.contactLastName}
                      onChange={(e) => handleChange('contactLastName', e.target.value)}
                      onBlur={() => handleBlur('contactLastName')}
                      className={inputClass(true, !!errors.contactLastName)}
                      disabled={gopayProfile?.username}
                    />
                  </InputField>
                )
              }
            </div>

            {/* Email */}
            <InputField label="Email" required icon={Mail} error={errors.contactEmail}>
              <input
                type="email"
                placeholder="john.doe@example.com"
                value={form.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                onBlur={() => handleBlur('contactEmail')}
                className={inputClass(true, !!errors.contactEmail)}
                disabled={gopayProfile?.email}
              />
            </InputField>

            {/* Nationality */}
            <InputField label="Nationality" required icon={Globe} error={errors.contactNationality}>
              <select
                value={form.contactNationality}
                onChange={(e) => handleChange('contactNationality', e.target.value)}
                onBlur={() => handleBlur('contactNationality')}
                className={selectClass(true, !!errors.contactNationality)}
              >
                <option value="">Select Nationality</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </InputField>

            {/* Phone Code + Phone Number */}
            <InputField label="Phone Number" required error={errors.contactPhoneNumber}>
              <div className="flex gap-2">
                <div className="relative w-36 flex-shrink-0">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={form.contactPhoneCode}
                    onChange={(e) => handleChange('contactPhoneCode', e.target.value)}
                    className={selectClass(true, false)}
                  >
                    {PHONE_CODES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.flag} {p.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  placeholder="812 3456 7890"
                  value={form.contactPhoneNumber}
                  onChange={(e) =>
                    handleChange('contactPhoneNumber', e.target.value.replace(/\D/g, ''))
                  }
                  onBlur={() => handleBlur('contactPhoneNumber')}
                  className={`flex-1 border rounded-xl text-sm text-gray-800 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 transition-all ${
                    errors.contactPhoneNumber
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
                  }`}
                />
              </div>
            </InputField>

            {/* Gender */}
            <InputField label="Gender" required error={errors.contactGender}>
              <select
                value={form.contactGender}
                onChange={(e) => handleChange('contactGender', e.target.value)}
                onBlur={() => handleBlur('contactGender')}
                className={selectClass(false, !!errors.contactGender)}
              >
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </InputField>
          </div>
        </div>

        {/* ─── RIGHT: Booking Summary ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
            {/* Room Image */}
            {(() => {
              const roomImg = (room?.roomImages ?? [])
                .flatMap((g) => g?.entries ?? [])
                .find((e) => e?.imageType === 'LARGE');
              return roomImg ? (
                <img src={roomImg?.url} alt={room?.roomName} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
                  No Image
                </div>
              );
            })()}

            <div className="p-5 space-y-4">
              {/* Hotel + Room name */}
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {hotel?.propertySummary?.name}
                </p>
                <h3 className="text-sm font-bold text-gray-800 mt-0.5 leading-snug">
                  {room?.roomName}
                </h3>
              </div>

              {/* Check-in / Check-out */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-blue-50 rounded-xl py-2.5 px-2">
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">Check-in</p>
                  <p className="text-sm font-bold text-blue-900 mt-0.5">
                    {checkIn ? moment(checkIn).format('DD MMM YYYY') : '-'}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl py-2.5 px-2">
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">Check-out</p>
                  <p className="text-sm font-bold text-blue-900 mt-0.5">
                    {checkOut ? moment(checkOut).format('DD MMM YYYY') : '-'}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <p className="text-xs text-center text-gray-500">
                {nights} night{nights > 1 ? 's' : ''}
                {bedText ? ` · ${bedText}` : ''}
                {room?.maxOccupancy ? ` · Max ${room.maxOccupancy} guests` : ''}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                {room?.isRefundable && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Refundable
                  </span>
                )}
                {room?.breakfastIncluded && (
                  <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    🍽️ Breakfast
                  </span>
                )}
                {room?.wifiIncluded && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    📶 Wi-Fi
                  </span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{currencyFormatter(nightlyPrice, currency)} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>{currencyFormatter(basePrice, currency)}</span>
                </div>
                {taxCharge && (
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Tax & Fees</span>
                    <span>
                      {currencyFormatter(taxCharge?.displayAmount * nights, taxCharge?.displayCurrency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Pay Now</span>
                  <span>
                    {currencyFormatter(payNowPrice, 'IDR')}
                  </span>
                </div>
                 <div className="flex justify-between text-gray-400 text-xs">
                  <span>Pay at Property</span>
                  <span>
                    {currencyFormatter(payAtProperty, 'IDR')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {currencyFormatter(
                      totalPrice,
                      currency
                    )}
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handleSubmit}
                className={`w-full ${themeColor} text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all active:scale-95`}
              >
                Proceed to Payment →
              </button>

              <p className="text-[10px] text-center text-gray-400">
                By continuing, you agree to our terms & conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          guest={form}
          room={room}
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          themeColor={themeColor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            onProceedPayment?.();
          }}
        />
      )}
    </div>
  );
}