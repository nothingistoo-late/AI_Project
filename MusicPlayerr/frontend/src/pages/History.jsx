import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { historyAPI, getImageUrl } from '../services/api';
import { Play, Clock, Music } from 'lucide-react';

export default function History() {
  const { playTrack } = usePlayer();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await historyAPI.getHistory(50);
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
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
        <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Playback History</h1>
          <p className="text-gray-600 dark:text-gray-400">Your recently played tracks</p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((track) => (
            <div
              key={track.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => playTrack(track, history)}
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
                  {track.album && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">{track.album}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No playback history yet. Start playing some music!</p>
        </div>
      )}
    </div>
  );
}





