using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Search service implementation (Business Logic Layer)
/// </summary>
public class SearchService : ISearchService
{
    private readonly ITrackRepository _trackRepository;
    private readonly IAlbumRepository _albumRepository;

    public SearchService(ITrackRepository trackRepository, IAlbumRepository albumRepository)
    {
        _trackRepository = trackRepository;
        _albumRepository = albumRepository;
    }

    public async Task<(IEnumerable<Track> tracks, IEnumerable<Album> albums)> SearchAsync(string query)
    {
        var tracks = await _trackRepository.SearchAsync(query);
        var albums = await _albumRepository.SearchAsync(query);
        return (tracks.Take(20), albums.Take(10));
    }

    public async Task<IEnumerable<string>> GetGenresAsync()
    {
        var allTracks = await _trackRepository.GetAllAsync();
        return allTracks
            .Where(t => !string.IsNullOrEmpty(t.Genre))
            .Select(t => t.Genre!)
            .Distinct()
            .OrderBy(g => g)
            .ToList();
    }
}

