export default function InputField({ label, required, icon: Icon, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <Icon className="w-4 h-4" />
          </div>
        )}
        {children}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}