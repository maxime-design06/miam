export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        className="w-6 h-6 rounded-full border-2 border-surface border-t-papaya animate-spin"
        aria-label="Chargement..."
      />
    </div>
  );
}
