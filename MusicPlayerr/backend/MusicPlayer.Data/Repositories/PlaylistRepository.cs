using Microsoft.EntityFrameworkCore;
using MusicPlayer.Data.Data;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Playlist repository implementation
/// </summary>
public class PlaylistRepository : Repository<Playlist>, IPlaylistRepository
{
    private new readonly ApplicationDbContext _context;

    public PlaylistRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Playlist>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(p => p.UserId == userId)
            .Include(p => p.PlaylistTracks)
                .ThenInclude(pt => pt.Track)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Playlist?> GetPlaylistByIdAsync(Guid id, Guid userId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
    }

    public async Task<Playlist?> GetWithTracksByIdAsync(Guid id, Guid userId)
    {
        return await _dbSet
            .Where(p => p.Id == id && p.UserId == userId)
            .Include(p => p.PlaylistTracks)
                .ThenInclude(pt => pt.Track)
                    .ThenInclude(t => t.AlbumNavigation)
            .FirstOrDefaultAsync();
    }

    public async Task<PlaylistTrack?> GetPlaylistTrackAsync(Guid playlistId, Guid trackId)
    {
        return await _context.PlaylistTracks
            .FirstOrDefaultAsync(pt => pt.PlaylistId == playlistId && pt.TrackId == trackId);
    }

    public async Task<IEnumerable<PlaylistTrack>> GetPlaylistTracksAsync(Guid playlistId)
    {
        return await _context.PlaylistTracks
            .Where(pt => pt.PlaylistId == playlistId)
            .OrderBy(pt => pt.Order)
            .ToListAsync();
    }
}

