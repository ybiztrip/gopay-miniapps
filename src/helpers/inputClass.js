export default function inputClass(hasIcon = true, hasError = false) {
  return [
    'w-full border rounded-xl text-sm text-gray-800 bg-white',
    'focus:outline-none focus:ring-2 transition-all',
    hasIcon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5',
    hasError
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400',
  ].join(' ');
}