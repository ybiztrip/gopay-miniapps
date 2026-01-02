function SplashScreen({ data }) {
  return (
    <div className={`w-full h-full ${data.themeColor} flex flex-col items-center justify-center text-white animate-in fade-in duration-300`}>
      {/* Logo Icon */}
      <div className="mb-6 transform scale-150 animate-bounce">
        <span className="text-6xl">🛏️</span>
      </div>

      {/* Logo Text */}
      <h1 className="text-6xl font-extrabold tracking-tighter mb-4 lowercase drop-shadow-md">
        .{data.logoText}.
      </h1>

      {/* Tagline */}
      <p className="font-serif text-xl font-medium text-center px-8 opacity-90 leading-snug">
        {data.tagline}
      </p>
    </div>
  );
}
export default SplashScreen;
