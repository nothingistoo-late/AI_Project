export default function RotatingDisc({ imageUrl, isPlaying, size = 100 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className={`rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600 shadow-lg ${
          isPlaying ? 'rotating' : 'rotating paused'
        }`}
        style={{ width: size, height: size }}
      >
        <img
          src={imageUrl}
          alt="Album cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-full z-10"
        style={{ width: size * 0.15, height: size * 0.15 }}
      />
    </div>
  );
}






