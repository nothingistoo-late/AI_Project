import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { tracksAPI, searchAPI, getImageUrl } from '../services/api';
import { Play, Upload, Search, X, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function Tracks() {
  const { playTrack } = usePlayer();
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteTrackId, setDeleteTrackId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const menuRef = useRef(null);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    title: '',
    artist: '',
    album: '',
    genre: '',
    coverImage: null,
  });
  const [editForm, setEditForm] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    coverImage: null,
  });

  useEffect(() => {
    loadTracks();
    loadGenres();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [searchQuery, selectedGenre, tracks]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTracks = async () => {
    try {
      const response = await tracksAPI.getAll();
      setTracks(response.data);
      setFilteredTracks(response.data);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const response = await searchAPI.getGenres();
      setGenres(response.data);
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const filterTracks = () => {
    let filtered = [...tracks];

    if (searchQuery) {
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter((track) => track.genre === selectedGenre);
    }

    setFilteredTracks(filtered);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    const formData = new FormData();
    formData.append('File', uploadForm.file);
    formData.append('Title', uploadForm.title);
    formData.append('Artist', uploadForm.artist);
    if (uploadForm.album) {
      formData.append('Album', uploadForm.album);
    }
    if (uploadForm.genre) {
      formData.append('Genre', uploadForm.genre);
    }
    if (uploadForm.coverImage) {
      formData.append('CoverImage', uploadForm.coverImage);
    }

    try {
      await tracksAPI.upload(formData);
      setShowUploadModal(false);
      setUploadForm({ file: null, title: '', artist: '', album: '', genre: '', coverImage: null });
      loadTracks();
      setToast({ isVisible: true, message: 'Track uploaded successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to upload track:', error);
      setToast({ isVisible: true, message: 'Failed to upload track. Please try again.', type: 'error' });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTrackId(id);
    setShowConfirmDialog(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!deleteTrackId) return;

    try {
      await tracksAPI.delete(deleteTrackId);
      loadTracks();
      setToast({ isVisible: true, message: 'Track deleted successfully', type: 'success' });
      setDeleteTrackId(null);
    } catch (error) {
      console.error('Failed to delete track:', error);
      setToast({ isVisible: true, message: 'Failed to delete track. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (track) => {
    setEditingTrack(track);
    setEditForm({
      title: track.title || '',
      artist: track.artist || '',
      album: track.album || '',
      genre: track.genre || '',
      coverImage: null,
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTrack) return;

    try {
      const formData = new FormData();
      formData.append('Title', editForm.title);
      formData.append('Artist', editForm.artist);
      if (editForm.album) {
        formData.append('Album', editForm.album);
      }
      if (editForm.genre) {
        formData.append('Genre', editForm.genre);
      }
      if (editForm.coverImage) {
        formData.append('CoverImage', editForm.coverImage);
      }

      await tracksAPI.update(editingTrack.id, formData);
      setShowEditModal(false);
      setEditingTrack(null);
      setEditForm({ title: '', artist: '', album: '', genre: '', coverImage: null });
      loadTracks();
      setToast({ isVisible: true, message: 'Track updated successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to update track:', error);
      setToast({ isVisible: true, message: 'Failed to update track. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tracks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your music library</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Track
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input-field pl-10 pr-8"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTracks.map((track) => (
          <div 
            key={track.id} 
            className="card hover:shadow-lg transition-shadow group cursor-pointer"
            onClick={() => playTrack(track, filteredTracks)}
          >
            <div className="relative mb-4 overflow-visible">
              <img
                src={getImageUrl(track.coverImagePath) || '/default-album.png'}
                alt={track.title}
                className="w-full aspect-square rounded-lg object-cover transition-all duration-300 group-hover:-translate-y-2"
                style={{
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '-8px 8px 24px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{track.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{track.artist}</p>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === track.id ? null : track.id);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                {openMenuId === track.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(track);
                        setOpenMenuId(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(track.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            {track.album && (
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{track.album}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')} • {track.playCount} plays
            </p>
          </div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No tracks found. Upload your first track to get started!
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Upload Track</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Audio File *</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Artist *</label>
                <input
                  type="text"
                  value={uploadForm.artist}
                  onChange={(e) => setUploadForm({ ...uploadForm, artist: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Album</label>
                <input
                  type="text"
                  value={uploadForm.album}
                  onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={uploadForm.genre}
                  onChange={(e) => setUploadForm({ ...uploadForm, genre: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadForm({ ...uploadForm, coverImage: e.target.files[0] })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 btn-primary">
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Edit Track</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTrack(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Artist *</label>
                <input
                  type="text"
                  value={editForm.artist}
                  onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Album</label>
                <input
                  type="text"
                  value={editForm.album}
                  onChange={(e) => setEditForm({ ...editForm, album: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={editForm.genre}
                  onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.files[0] })}
                  className="input-field"
                />
                {editingTrack.coverImagePath && (
                  <p className="text-xs text-gray-500 mt-1">Current: {editingTrack.coverImagePath}</p>
                )}
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 btn-primary">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTrack(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setDeleteTrackId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Track"
        message="Are you sure you want to delete this track? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}





