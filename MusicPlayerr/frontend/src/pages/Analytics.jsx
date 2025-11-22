import { useEffect, useState } from 'react';
import { analyticsAPI, getImageUrl } from '../services/api';
import { BarChart3, TrendingUp, Music, Disc, Users, ListMusic } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [statsRes, tracksRes, albumsRes, uploadsRes] = await Promise.all([
        analyticsAPI.getUserStats(),
        analyticsAPI.getTopTracks(10),
        analyticsAPI.getTopAlbums(10),
        analyticsAPI.getRecentUploads(10),
      ]);

      setStats(statsRes.data);
      setTopTracks(tracksRes.data);
      setTopAlbums(albumsRes.data);
      setRecentUploads(uploadsRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Platform statistics and insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Music className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</p>
                <p className="text-2xl font-bold">{stats.totalTracks}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Disc className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Albums</p>
                <p className="text-2xl font-bold">{stats.totalAlbums}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <ListMusic className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Playlists</p>
                <p className="text-2xl font-bold">{stats.totalPlaylists}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Tracks */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Top Tracks</h2>
        </div>
        <div className="card">
          <div className="space-y-4">
            {topTracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                <div className="flex-shrink-0 w-8 text-center font-bold text-primary-600 dark:text-primary-400">
                  {index + 1}
                </div>
                <img
                  src={getImageUrl(track.coverImagePath) || '/default-album.png'}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {track.playCount} plays
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Albums */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Disc className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Top Albums</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topAlbums.map((album) => (
            <div key={album.id} className="card">
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
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{album.trackCount} tracks</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Uploads */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Recent Uploads</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentUploads.map((track) => (
            <div key={track.id} className="card">
              <div className="flex items-center gap-4">
                <img
                  src={getImageUrl(track.coverImagePath) || '/default-album.png'}
                  alt={track.title}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(track.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}





