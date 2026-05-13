export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative max-w-2xl mx-auto mb-12">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for anime..."
        className="block w-full pl-14 pr-6 py-5 bg-gray-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all backdrop-blur-md"
      />
    </div>
  );
}
