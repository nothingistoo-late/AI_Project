using Microsoft.EntityFrameworkCore;
using MusicPlayer.Data.Data;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Track repository implementation
/// </summary>
public class TrackRepository : Repository<Track>, ITrackRepository
{
    public TrackRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Track>> GetWithAlbumAsync()
    {
        return await _dbSet.Include(t => t.AlbumNavigation).ToListAsync();
    }

    public async Task<IEnumerable<Track>> SearchAsync(string searchTerm)
    {
        return await _dbSet
            .Include(t => t.AlbumNavigation)
            .Where(t => t.Title.Contains(searchTerm) || 
                       t.Artist.Contains(searchTerm) || 
                       (t.Album != null && t.Album.Contains(searchTerm)))
            .ToListAsync();
    }

    public async Task<IEnumerable<Track>> GetByGenreAsync(string genre)
    {
        return await _dbSet
            .Include(t => t.AlbumNavigation)
            .Where(t => t.Genre == genre)
            .ToListAsync();
    }

    public async Task<IEnumerable<Track>> GetByAlbumIdAsync(Guid albumId)
    {
        return await _dbSet
            .Include(t => t.AlbumNavigation)
            .Where(t => t.AlbumId == albumId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Track>> GetTopTracksAsync(int limit)
    {
        return await _dbSet
            .OrderByDescending(t => t.PlayCount)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IEnumerable<Track>> GetRecentTracksAsync(int limit)
    {
        return await _dbSet
            .OrderByDescending(t => t.UploadedAt)
            .Take(limit)
            .ToListAsync();
    }
}

