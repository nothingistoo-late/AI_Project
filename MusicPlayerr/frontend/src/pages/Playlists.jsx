import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { playlistsAPI } from '../services/api';
import { Plus, Search, X, ListMusic, Music, MoreVertical, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function Playlists() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deletePlaylistId, setDeletePlaylistId] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const menuRef = useRef(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadPlaylists();
  }, []);

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

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistsAPI.getAll();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await playlistsAPI.create(createForm);
      console.log('Playlist created:', response.data);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
      // Reload playlists after creation
      await loadPlaylists();
      setToast({ isVisible: true, message: 'Playlist created successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to create playlist:', error);
      console.error('Error details:', error.response?.data || error.message);
      setToast({ isVisible: true, message: `Failed to create playlist: ${error.response?.data?.message || error.message}`, type: 'error' });
    }
  };

  const handleDeleteClick = (id) => {
    setDeletePlaylistId(id);
    setShowConfirmDialog(true);
    setOpenMenuId(null);
  };

  const handleDelete = async () => {
    if (!deletePlaylistId) return;

    try {
      await playlistsAPI.delete(deletePlaylistId);
      loadPlaylists();
      setToast({ isVisible: true, message: 'Playlist deleted successfully', type: 'success' });
      setDeletePlaylistId(null);
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      setToast({ isVisible: true, message: 'Failed to delete playlist. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (playlist) => {
    setEditingPlaylist(playlist);
    setEditForm({
      name: playlist.name || '',
      description: playlist.description || '',
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPlaylist) return;

    try {
      await playlistsAPI.update(editingPlaylist.id, editForm);
      setShowEditModal(false);
      setEditingPlaylist(null);
      setEditForm({ name: '', description: '' });
      loadPlaylists();
      setToast({ isVisible: true, message: 'Playlist updated successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to update playlist:', error);
      setToast({ isVisible: true, message: 'Failed to update playlist. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Playlists</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your playlists</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(`/playlists/${playlist.id}`)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <ListMusic className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {playlist.description}
                      </p>
                    )}
                    {playlist.playlistTracks && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {playlist.playlistTracks.length} {playlist.playlistTracks.length === 1 ? 'track' : 'tracks'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === playlist.id ? null : playlist.id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      {openMenuId === playlist.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(playlist);
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
                              handleDeleteClick(playlist.id);
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No playlists found. Create your first playlist to get started!</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Create Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Playlist Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="input-field"
                  rows={3}
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
      {showEditModal && editingPlaylist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Edit Playlist</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPlaylist(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Playlist Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 btn-primary">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlaylist(null);
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
          setDeletePlaylistId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
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





