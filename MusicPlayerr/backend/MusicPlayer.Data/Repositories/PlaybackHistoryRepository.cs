using Microsoft.EntityFrameworkCore;
using MusicPlayer.Data.Data;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Playback history repository implementation
/// </summary>
public class PlaybackHistoryRepository : Repository<PlaybackHistory>, IPlaybackHistoryRepository
{
    private new readonly ApplicationDbContext _context;

    public PlaybackHistoryRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Track>> GetUserHistoryAsync(Guid userId, int limit)
    {
        return await _context.PlaybackHistory
            .Where(h => h.UserId == userId)
            .Include(h => h.Track)
                .ThenInclude(t => t.AlbumNavigation)
            .OrderByDescending(h => h.PlayedAt)
            .Take(limit)
            .Select(h => h.Track)
            .Distinct()
            .ToListAsync();
    }

    public async Task<IEnumerable<Track>> GetRecentTracksAsync(Guid userId, int limit)
    {
        return await _context.PlaybackHistory
            .Where(h => h.UserId == userId)
            .Include(h => h.Track)
                .ThenInclude(t => t.AlbumNavigation)
            .OrderByDescending(h => h.PlayedAt)
            .Select(h => h.Track)
            .Take(limit)
            .ToListAsync();
    }

    public async Task AddPlaybackAsync(Guid userId, Guid trackId)
    {
        var history = new PlaybackHistory
        {
            UserId = userId,
            TrackId = trackId
        };
        await _context.PlaybackHistory.AddAsync(history);
        await _context.SaveChangesAsync();
    }
}

