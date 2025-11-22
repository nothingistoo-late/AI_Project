import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { playlistsAPI, tracksAPI } from '../services/api';
import { Play, Plus, X, ArrowLeft, Music, ListMusic } from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTrack, setIsAddingTrack] = useState(false);

  const loadPlaylist = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await playlistsAPI.getById(id);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Failed to load playlist:', error);
      alert('Failed to load playlist');
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAllTracks = useCallback(async () => {
    try {
      const response = await tracksAPI.getAll();
      setAllTracks(response.data || []);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  }, []);

  useEffect(() => {
    loadPlaylist();
    loadAllTracks();
  }, [loadPlaylist, loadAllTracks]);

  const handleAddTrack = async (trackId) => {
    if (isAddingTrack) return; // Prevent multiple simultaneous adds
    try {
      setIsAddingTrack(true);
      await playlistsAPI.addTrack(id, trackId);
      setShowAddTrackModal(false);
      setSearchQuery('');
      // Reload playlist to show new track
      await loadPlaylist();
    } catch (error) {
      console.error('Failed to add track:', error);
      alert(error.response?.data?.message || 'Failed to add track to playlist');
    } finally {
      setIsAddingTrack(false);
    }
  };

  const handleRemoveTrack = async (trackId) => {
    if (!confirm('Are you sure you want to remove this track from the playlist?')) return;
    
    try {
      await playlistsAPI.removeTrack(id, trackId);
      await loadPlaylist(); // Reload playlist
    } catch (error) {
      console.error('Failed to remove track:', error);
      alert('Failed to remove track from playlist');
    }
  };

  // Filter tracks that are not already in the playlist
  const playlistTrackIds = playlist?.playlistTracks?.map(pt => pt.track?.id || pt.trackId) || [];
  const availableTracks = allTracks.filter(track => !playlistTrackIds.includes(track.id));
  const filteredTracks = availableTracks.filter(track =>
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Playlist not found</p>
        <button onClick={() => navigate('/playlists')} className="btn-primary mt-4">
          Back to Playlists
        </button>
      </div>
    );
  }

  const tracks = playlist.playlistTracks
    ?.map(pt => pt.track)
    .filter(t => t != null)
    .sort((a, b) => {
      const orderA = playlist.playlistTracks.find(pt => pt.trackId === a.id)?.order || 0;
      const orderB = playlist.playlistTracks.find(pt => pt.trackId === b.id)?.order || 0;
      return orderA - orderB;
    }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/playlists')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-gray-600 dark:text-gray-400">{playlist.description}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </p>
        </div>
        <button
          onClick={() => setShowAddTrackModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Tracks
        </button>
      </div>

      {/* Tracks List */}
      {tracks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No tracks in this playlist yet.</p>
          <button
            onClick={() => setShowAddTrackModal(true)}
            className="btn-primary mt-4"
          >
            Add Tracks
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, tracks)}
              className="card hover:shadow-md transition-shadow flex items-center gap-4 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{track.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {track.artist}
                </p>
                {track.album && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {track.album}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track, tracks);
                  }}
                  className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-full transition-colors opacity-0 group-hover:opacity-100 text-primary-600 dark:text-primary-400"
                  title="Play"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTrack(track.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from playlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">Add Tracks to Playlist</h2>
              <button
                onClick={() => {
                  setShowAddTrackModal(false);
                  setSearchQuery('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {filteredTracks.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <ListMusic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>
                    {searchQuery
                      ? 'No tracks found matching your search.'
                      : 'No available tracks to add.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTracks.map((track) => (
                    <div
                      key={track.id}
                      className="card hover:shadow-md transition-shadow flex items-center gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {track.artist}
                        </p>
                        {track.album && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            {track.album}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddTrack(track.id)}
                        disabled={isAddingTrack}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        {isAddingTrack ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

