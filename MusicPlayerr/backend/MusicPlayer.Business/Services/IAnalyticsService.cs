using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Analytics service interface (Business Logic Layer)
/// </summary>
public interface IAnalyticsService
{
    Task<IEnumerable<Track>> GetTopTracksAsync(int limit);
    Task<IEnumerable<object>> GetTopAlbumsAsync(int limit);
    Task<IEnumerable<Track>> GetRecentUploadsAsync(int limit);
    Task<object> GetUserStatsAsync();
}

