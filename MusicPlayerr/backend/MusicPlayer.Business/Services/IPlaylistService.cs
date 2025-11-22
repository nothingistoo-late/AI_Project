using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Playlist service interface (Business Logic Layer)
/// </summary>
public interface IPlaylistService
{
    Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(Guid userId);
    Task<Playlist?> GetPlaylistByIdAsync(Guid id, Guid userId);
    Task<Playlist> CreatePlaylistAsync(Playlist playlist, Guid userId);
    Task<Playlist?> UpdatePlaylistAsync(Guid id, Playlist playlist, Guid userId);
    Task<bool> DeletePlaylistAsync(Guid id, Guid userId);
    Task<bool> AddTrackToPlaylistAsync(Guid playlistId, Guid trackId, Guid userId);
    Task<bool> RemoveTrackFromPlaylistAsync(Guid playlistId, Guid trackId, Guid userId);
}

