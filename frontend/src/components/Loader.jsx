const Loader = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen
          ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50"
          : "w-full h-full min-h-[200px]"
      }`}>
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading...</p>
    </div>
  );
};

export default Loader;
