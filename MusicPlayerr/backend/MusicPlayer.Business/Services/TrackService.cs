using Microsoft.AspNetCore.Http;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Track service implementation (Business Logic Layer)
/// </summary>
public class TrackService : ITrackService
{
    private readonly ITrackRepository _trackRepository;
    private readonly IPlaybackHistoryRepository _historyRepository;

    public TrackService(ITrackRepository trackRepository, IPlaybackHistoryRepository historyRepository)
    {
        _trackRepository = trackRepository;
        _historyRepository = historyRepository;
    }

    public async Task<IEnumerable<Track>> GetAllTracksAsync(string? search, string? genre, Guid? albumId)
    {
        if (!string.IsNullOrEmpty(search))
        {
            return await _trackRepository.SearchAsync(search);
        }

        if (!string.IsNullOrEmpty(genre))
        {
            return await _trackRepository.GetByGenreAsync(genre);
        }

        if (albumId.HasValue)
        {
            return await _trackRepository.GetByAlbumIdAsync(albumId.Value);
        }

        return await _trackRepository.GetWithAlbumAsync();
    }

    public async Task<Track?> GetTrackByIdAsync(Guid id)
    {
        return await _trackRepository.GetByIdAsync(id);
    }

    public async Task<Track> CreateTrackAsync(Track track, IFormFile? coverImage, string webRootPath)
    {
        // Save cover image if provided
        if (coverImage != null && coverImage.Length > 0)
        {
            var coverDir = Path.Combine(webRootPath, "uploads", "covers");
            Directory.CreateDirectory(coverDir);
            var coverExtension = Path.GetExtension(coverImage.FileName).ToLowerInvariant();
            var coverFileName = $"{Guid.NewGuid()}{coverExtension}";
            var coverImagePath = Path.Combine(coverDir, coverFileName);
            using (var stream = new FileStream(coverImagePath, FileMode.Create))
            {
                await coverImage.CopyToAsync(stream);
            }
            track.CoverImagePath = $"/uploads/covers/{coverFileName}";
        }

        return await _trackRepository.AddAsync(track);
    }

    public async Task<Track?> UpdateTrackAsync(Guid id, object updateDto, string webRootPath)
    {
        var existingTrack = await _trackRepository.GetByIdAsync(id);
        if (existingTrack == null)
        {
            return null;
        }

        // Use reflection to get properties from DTO
        var dtoType = updateDto.GetType();
        var titleProp = dtoType.GetProperty("Title");
        var artistProp = dtoType.GetProperty("Artist");
        var albumProp = dtoType.GetProperty("Album");
        var genreProp = dtoType.GetProperty("Genre");
        var coverImageProp = dtoType.GetProperty("CoverImage");

        if (titleProp != null && titleProp.GetValue(updateDto) is string title)
        {
            existingTrack.Title = title;
        }
        if (artistProp != null && artistProp.GetValue(updateDto) is string artist)
        {
            existingTrack.Artist = artist;
        }
        if (albumProp != null && albumProp.GetValue(updateDto) is string album)
        {
            existingTrack.Album = album;
        }
        if (genreProp != null && genreProp.GetValue(updateDto) is string genre)
        {
            existingTrack.Genre = genre;
        }

        // Handle cover image update
        if (coverImageProp != null && coverImageProp.GetValue(updateDto) is IFormFile coverImage && coverImage.Length > 0)
        {
            // Delete old cover image if exists
            if (!string.IsNullOrEmpty(existingTrack.CoverImagePath))
            {
                var oldCoverPath = Path.Combine(webRootPath, existingTrack.CoverImagePath.TrimStart('/'));
                if (System.IO.File.Exists(oldCoverPath))
                {
                    System.IO.File.Delete(oldCoverPath);
                }
            }

            // Save new cover image
            var coverDir = Path.Combine(webRootPath, "uploads", "covers");
            Directory.CreateDirectory(coverDir);
            var coverExtension = Path.GetExtension(coverImage.FileName).ToLowerInvariant();
            var coverFileName = $"{Guid.NewGuid()}{coverExtension}";
            var coverImagePath = Path.Combine(coverDir, coverFileName);
            using (var stream = new FileStream(coverImagePath, FileMode.Create))
            {
                await coverImage.CopyToAsync(stream);
            }
            existingTrack.CoverImagePath = $"/uploads/covers/{coverFileName}";
        }

        await _trackRepository.UpdateAsync(existingTrack);
        return existingTrack;
    }

    public async Task<bool> DeleteTrackAsync(Guid id, string webRootPath)
    {
        var track = await _trackRepository.GetByIdAsync(id);
        if (track == null)
        {
            return false;
        }

        // Delete file from disk
        if (!string.IsNullOrEmpty(track.FilePath))
        {
            var filePath = Path.Combine(webRootPath, track.FilePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        await _trackRepository.DeleteAsync(track);
        return true;
    }

    public async Task RecordPlaybackAsync(Guid trackId, Guid userId)
    {
        var track = await _trackRepository.GetByIdAsync(trackId);
        if (track != null)
        {
            track.PlayCount++;
            await _trackRepository.UpdateAsync(track);
            await _historyRepository.AddPlaybackAsync(userId, trackId);
        }
    }
}

