using Microsoft.EntityFrameworkCore;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Data;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Playlist service implementation (Business Logic Layer)
/// </summary>
public class PlaylistService : IPlaylistService
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly ApplicationDbContext _context;

    public PlaylistService(IPlaylistRepository playlistRepository, ApplicationDbContext context)
    {
        _playlistRepository = playlistRepository;
        _context = context;
    }

    public async Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(Guid userId)
    {
        return await _playlistRepository.GetByUserIdAsync(userId);
    }

    public async Task<Playlist?> GetPlaylistByIdAsync(Guid id, Guid userId)
    {
        return await _playlistRepository.GetWithTracksByIdAsync(id, userId);
    }

    public async Task<Playlist> CreatePlaylistAsync(Playlist playlist, Guid userId)
    {
        playlist.UserId = userId;
        return await _playlistRepository.AddAsync(playlist);
    }

    public async Task<Playlist?> UpdatePlaylistAsync(Guid id, Playlist playlist, Guid userId)
    {
        var existingPlaylist = await _playlistRepository.GetWithTracksByIdAsync(id, userId);
        if (existingPlaylist == null)
        {
            return null;
        }

        existingPlaylist.Name = playlist.Name;
        existingPlaylist.Description = playlist.Description;

        await _playlistRepository.UpdateAsync(existingPlaylist);
        return existingPlaylist;
    }

    public async Task<bool> DeletePlaylistAsync(Guid id, Guid userId)
    {
        var playlist = await _playlistRepository.GetWithTracksByIdAsync(id, userId);
        if (playlist == null)
        {
            return false;
        }

        await _playlistRepository.DeleteAsync(playlist);
        return true;
    }

    public async Task<bool> AddTrackToPlaylistAsync(Guid playlistId, Guid trackId, Guid userId)
    {
        var playlist = await _playlistRepository.GetPlaylistByIdAsync(playlistId, userId);
        if (playlist == null)
        {
            return false;
        }

        var existing = await _playlistRepository.GetPlaylistTrackAsync(playlistId, trackId);
        if (existing != null)
        {
            return false; // Already exists
        }

        var playlistTracks = await _playlistRepository.GetPlaylistTracksAsync(playlistId);
        var maxOrder = playlistTracks.Any() ? playlistTracks.Max(pt => pt.Order) : 0;

        var playlistTrack = new PlaylistTrack
        {
            PlaylistId = playlistId,
            TrackId = trackId,
            Order = maxOrder + 1
        };

        _context.PlaylistTracks.Add(playlistTrack);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveTrackFromPlaylistAsync(Guid playlistId, Guid trackId, Guid userId)
    {
        var playlist = await _playlistRepository.GetPlaylistByIdAsync(playlistId, userId);
        if (playlist == null)
        {
            return false;
        }

        var playlistTrack = await _playlistRepository.GetPlaylistTrackAsync(playlistId, trackId);
        if (playlistTrack == null)
        {
            return false;
        }

        _context.PlaylistTracks.Remove(playlistTrack);
        await _context.SaveChangesAsync();
        return true;
    }
}

