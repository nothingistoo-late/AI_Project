using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Track repository interface
/// </summary>
public interface ITrackRepository : IRepository<Track>
{
    Task<IEnumerable<Track>> GetWithAlbumAsync();
    Task<IEnumerable<Track>> SearchAsync(string searchTerm);
    Task<IEnumerable<Track>> GetByGenreAsync(string genre);
    Task<IEnumerable<Track>> GetByAlbumIdAsync(Guid albumId);
    Task<IEnumerable<Track>> GetTopTracksAsync(int limit);
    Task<IEnumerable<Track>> GetRecentTracksAsync(int limit);
}

