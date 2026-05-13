export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
