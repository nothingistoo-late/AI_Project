using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Playback history repository interface
/// </summary>
public interface IPlaybackHistoryRepository : IRepository<PlaybackHistory>
{
    Task<IEnumerable<Track>> GetUserHistoryAsync(Guid userId, int limit);
    Task<IEnumerable<Track>> GetRecentTracksAsync(Guid userId, int limit);
    Task AddPlaybackAsync(Guid userId, Guid trackId);
}

