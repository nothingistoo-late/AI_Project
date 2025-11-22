import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { tracksAPI, albumsAPI, historyAPI, getImageUrl } from '../services/api';
import { Play, Music, Disc, Clock } from 'lucide-react';

export default function Dashboard() {
  const { playTrack } = usePlayer();
  const [recentTracks, setRecentTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tracksRes, albumsRes, historyRes] = await Promise.all([
        tracksAPI.getAll({ search: '' }),
        albumsAPI.getAll(),
        historyAPI.getRecent(10),
      ]);

      // Filter out null/undefined and ensure unique IDs
      // Remove duplicates by ID
      const recent = (historyRes.data || [])
        .filter(t => t && t.id)
        .filter((t, index, self) => index === self.findIndex(tr => tr.id === t.id))
        .slice(0, 5);
      
      const popular = (tracksRes.data || [])
        .filter(t => t && t.id)
        .filter((t, index, self) => index === self.findIndex(tr => tr.id === t.id))
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, 5);
      
      const albumList = (albumsRes.data || [])
        .filter(a => a && a.id)
        .filter((a, index, self) => index === self.findIndex(al => al.id === a.id))
        .slice(0, 6);
      
      setRecentTracks(recent);
      setPopularTracks(popular);
      setAlbums(albumList);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your music library</p>
      </div>

      {/* Recently Played */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Recently Played</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTracks.length > 0 ? (
            recentTracks.map((track, index) => (
              <div
                key={`recent-${track.id}-${index}`}
                className="card hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => playTrack(track)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getImageUrl(track.coverImagePath) || '/default-album.png'}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent tracks</p>
          )}
        </div>
      </section>

      {/* Popular Tracks */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Popular Tracks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTracks.map((track, index) => (
            <div
              key={`popular-${track.id}-${index}`}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => playTrack(track)}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={getImageUrl(track.coverImagePath) || '/default-album.png'}
                    alt={track.title}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{track.playCount} plays</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Albums */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Disc className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Albums</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {albums.map((album, index) => (
            <div
              key={`album-${album.id}-${index}`}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <img
                src={getImageUrl(album.coverImagePath) || '/default-album.png'}
                alt={album.name}
                className="w-full aspect-square rounded-lg object-cover mb-3"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                }}
              />
              <h3 className="font-semibold text-sm truncate">{album.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{album.artist}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}





