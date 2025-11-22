import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { albumsAPI, tracksAPI, getImageUrl } from '../services/api';
import { Plus, Search, X, Music, MoreVertical, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function Albums() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteAlbumId, setDeleteAlbumId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const menuRef = useRef(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    artist: '',
    genre: '',
    coverImage: null,
  });
  const [editForm, setEditForm] = useState({
    name: '',
    artist: '',
    genre: '',
    coverImage: null,
  });

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const response = await albumsAPI.getAll(searchQuery);
      setAlbums(response.data || []);
    } catch (error) {
      console.error('Failed to load albums:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Name', createForm.name);
    formData.append('Artist', createForm.artist);
    if (createForm.genre) {
      formData.append('Genre', createForm.genre);
    }
    if (createForm.coverImage) {
      formData.append('CoverImage', createForm.coverImage);
    }

    try {
      await albumsAPI.create(formData);
      setShowCreateModal(false);
      setCreateForm({ name: '', artist: '', genre: '', coverImage: null });
      loadAlbums();
      setToast({ isVisible: true, message: 'Album created successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to create album:', error);
      setToast({ isVisible: true, message: 'Failed to create album. Please try again.', type: 'error' });
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteAlbumId(id);
    setShowConfirmDialog(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!deleteAlbumId) return;

    try {
      await albumsAPI.delete(deleteAlbumId);
      loadAlbums();
      setToast({ isVisible: true, message: 'Album deleted successfully', type: 'success' });
      setDeleteAlbumId(null);
    } catch (error) {
      console.error('Failed to delete album:', error);
      setToast({ isVisible: true, message: 'Failed to delete album. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    setEditForm({
      name: album.name || '',
      artist: album.artist || '',
      genre: album.genre || '',
      coverImage: null,
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingAlbum) return;

    try {
      const formData = new FormData();
      formData.append('Name', editForm.name);
      formData.append('Artist', editForm.artist);
      if (editForm.genre) {
        formData.append('Genre', editForm.genre);
      }
      if (editForm.coverImage) {
        formData.append('CoverImage', editForm.coverImage);
      }

      await albumsAPI.update(editingAlbum.id, formData);
      setShowEditModal(false);
      setEditingAlbum(null);
      setEditForm({ name: '', artist: '', genre: '', coverImage: null });
      loadAlbums();
      setToast({ isVisible: true, message: 'Album updated successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to update album:', error);
      setToast({ isVisible: true, message: 'Failed to update album. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Albums</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and manage your albums</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Album
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search albums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(`/albums/${album.id}`)}
          >
            <div className="relative mb-3">
              <img
                src={getImageUrl(album.coverImagePath) || '/default-album.png'}
                alt={album.name}
                className="w-full aspect-square rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23e5e7eb"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3EMusic%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{album.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{album.artist}</p>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === album.id ? null : album.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {openMenuId === album.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(album);
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
                        handleDeleteClick(album.id);
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
            {album.tracks && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {album.tracks.length} {album.tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            )}
          </div>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No albums found. Create your first album to get started!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create Album</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Album Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Artist *</label>
                <input
                  type="text"
                  value={createForm.artist}
                  onChange={(e) => setCreateForm({ ...createForm, artist: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={createForm.genre}
                  onChange={(e) => setCreateForm({ ...createForm, genre: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateForm({ ...createForm, coverImage: e.target.files[0] })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
      {showEditModal && editingAlbum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Edit Album</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAlbum(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Album Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                {editingAlbum.coverImagePath && (
                  <p className="text-xs text-gray-500 mt-1">Current: {editingAlbum.coverImagePath}</p>
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
                    setEditingAlbum(null);
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
          setDeleteAlbumId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
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





