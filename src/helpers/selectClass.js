export default function selectClass(hasIcon = false, hasError = false) {
  return [
    'w-full border rounded-xl text-sm text-gray-800 bg-white appearance-none cursor-pointer',
    'focus:outline-none focus:ring-2 transition-all',
    hasIcon ? 'pl-9 pr-8 py-2.5' : 'pl-3 pr-8 py-2.5',
    hasError
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400',
  ].join(' ');
}