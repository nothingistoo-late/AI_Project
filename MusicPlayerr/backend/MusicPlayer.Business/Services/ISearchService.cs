using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Search service interface (Business Logic Layer)
/// </summary>
public interface ISearchService
{
    Task<(IEnumerable<Track> tracks, IEnumerable<Album> albums)> SearchAsync(string query);
    Task<IEnumerable<string>> GetGenresAsync();
}

