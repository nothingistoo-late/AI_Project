using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Album repository interface
/// </summary>
public interface IAlbumRepository : IRepository<Album>
{
    Task<IEnumerable<Album>> GetWithTracksAsync();
    Task<Album?> GetWithTracksByIdAsync(Guid id);
    Task<IEnumerable<Album>> SearchAsync(string searchTerm);
    Task<IEnumerable<Album>> GetTopAlbumsAsync(int limit);
}

