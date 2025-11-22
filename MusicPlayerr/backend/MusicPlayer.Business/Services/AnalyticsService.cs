using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Analytics service implementation (Business Logic Layer)
/// </summary>
public class AnalyticsService : IAnalyticsService
{
    private readonly ITrackRepository _trackRepository;
    private readonly IAlbumRepository _albumRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRepository<Playlist> _playlistRepository;

    public AnalyticsService(
        ITrackRepository trackRepository,
        IAlbumRepository albumRepository,
        IUserRepository userRepository,
        IRepository<Playlist> playlistRepository)
    {
        _trackRepository = trackRepository;
        _albumRepository = albumRepository;
        _userRepository = userRepository;
        _playlistRepository = playlistRepository;
    }

    public async Task<IEnumerable<Track>> GetTopTracksAsync(int limit)
    {
        return await _trackRepository.GetTopTracksAsync(limit);
    }

    public async Task<IEnumerable<object>> GetTopAlbumsAsync(int limit)
    {
        var albums = await _albumRepository.GetTopAlbumsAsync(limit);
        return albums.Select(a => new
        {
            a.Id,
            a.Name,
            a.Artist,
            a.Genre,
            a.CoverImagePath,
            TrackCount = a.Tracks.Count
        });
    }

    public async Task<IEnumerable<Track>> GetRecentUploadsAsync(int limit)
    {
        return await _trackRepository.GetRecentTracksAsync(limit);
    }

    public async Task<object> GetUserStatsAsync()
    {
        var totalUsers = (await _userRepository.GetAllAsync()).Count();
        var totalTracks = (await _trackRepository.GetAllAsync()).Count();
        var totalAlbums = (await _albumRepository.GetAllAsync()).Count();
        var totalPlaylists = (await _playlistRepository.GetAllAsync()).Count();

        return new
        {
            totalUsers,
            totalTracks,
            totalAlbums,
            totalPlaylists
        };
    }
}

