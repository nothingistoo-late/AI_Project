using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Business.Services;

/// <summary>
/// History service interface (Business Logic Layer)
/// </summary>
public interface IHistoryService
{
    Task<IEnumerable<Track>> GetUserHistoryAsync(Guid userId, int limit);
    Task<IEnumerable<Track>> GetRecentTracksAsync(Guid userId, int limit);
}

