using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Playlist repository interface
/// </summary>
public interface IPlaylistRepository : IRepository<Playlist>
{
    Task<IEnumerable<Playlist>> GetByUserIdAsync(Guid userId);
    Task<Playlist?> GetPlaylistByIdAsync(Guid id, Guid userId);
    Task<Playlist?> GetWithTracksByIdAsync(Guid id, Guid userId);
    Task<PlaylistTrack?> GetPlaylistTrackAsync(Guid playlistId, Guid trackId);
    Task<IEnumerable<PlaylistTrack>> GetPlaylistTracksAsync(Guid playlistId);
}

