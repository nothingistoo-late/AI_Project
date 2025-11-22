using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// History service implementation (Business Logic Layer)
/// </summary>
public class HistoryService : IHistoryService
{
    private readonly IPlaybackHistoryRepository _historyRepository;

    public HistoryService(IPlaybackHistoryRepository historyRepository)
    {
        _historyRepository = historyRepository;
    }

    public async Task<IEnumerable<Track>> GetUserHistoryAsync(Guid userId, int limit)
    {
        return await _historyRepository.GetUserHistoryAsync(userId, limit);
    }

    public async Task<IEnumerable<Track>> GetRecentTracksAsync(Guid userId, int limit)
    {
        return await _historyRepository.GetRecentTracksAsync(userId, limit);
    }
}

