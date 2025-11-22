using Microsoft.EntityFrameworkCore;
using MusicPlayer.Data.Data;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Data.Repositories;

/// <summary>
/// Album repository implementation
/// </summary>
public class AlbumRepository : Repository<Album>, IAlbumRepository
{
    public AlbumRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Album>> GetWithTracksAsync()
    {
        return await _dbSet.Include(a => a.Tracks).ToListAsync();
    }

    public async Task<Album?> GetWithTracksByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(a => a.Tracks)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<IEnumerable<Album>> SearchAsync(string searchTerm)
    {
        return await _dbSet
            .Include(a => a.Tracks)
            .Where(a => a.Name.Contains(searchTerm) || a.Artist.Contains(searchTerm))
            .ToListAsync();
    }

    public async Task<IEnumerable<Album>> GetTopAlbumsAsync(int limit)
    {
        return await _dbSet
            .Include(a => a.Tracks)
            .OrderByDescending(a => a.Tracks.Count)
            .Take(limit)
            .ToListAsync();
    }
}

