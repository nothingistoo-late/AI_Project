using Microsoft.AspNetCore.Http;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Album service implementation (Business Logic Layer)
/// </summary>
public class AlbumService : IAlbumService
{
    private readonly IAlbumRepository _albumRepository;
    private readonly ITrackRepository _trackRepository;

    public AlbumService(IAlbumRepository albumRepository, ITrackRepository trackRepository)
    {
        _albumRepository = albumRepository;
        _trackRepository = trackRepository;
    }

    public async Task<IEnumerable<Album>> GetAllAlbumsAsync(string? search)
    {
        if (!string.IsNullOrEmpty(search))
        {
            return await _albumRepository.SearchAsync(search);
        }

        return await _albumRepository.GetWithTracksAsync();
    }

    public async Task<Album?> GetAlbumByIdAsync(Guid id)
    {
        return await _albumRepository.GetWithTracksByIdAsync(id);
    }

    public async Task<Album> CreateAlbumAsync(Album album, IFormFile? coverImage, string webRootPath)
    {
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
            album.CoverImagePath = $"/uploads/covers/{coverFileName}";
        }

        return await _albumRepository.AddAsync(album);
    }

    public async Task<Album?> UpdateAlbumAsync(Guid id, object updateDto, string webRootPath)
    {
        var existingAlbum = await _albumRepository.GetByIdAsync(id);
        if (existingAlbum == null)
        {
            return null;
        }

        // Use reflection to get properties from DTO
        var dtoType = updateDto.GetType();
        var nameProp = dtoType.GetProperty("Name");
        var artistProp = dtoType.GetProperty("Artist");
        var genreProp = dtoType.GetProperty("Genre");
        var coverImageProp = dtoType.GetProperty("CoverImage");

        if (nameProp != null && nameProp.GetValue(updateDto) is string name)
        {
            existingAlbum.Name = name;
        }
        if (artistProp != null && artistProp.GetValue(updateDto) is string artist)
        {
            existingAlbum.Artist = artist;
        }
        if (genreProp != null && genreProp.GetValue(updateDto) is string genre)
        {
            existingAlbum.Genre = genre;
        }

        // Handle cover image update
        if (coverImageProp != null && coverImageProp.GetValue(updateDto) is IFormFile coverImage && coverImage.Length > 0)
        {
            // Delete old cover image if exists
            if (!string.IsNullOrEmpty(existingAlbum.CoverImagePath))
            {
                var oldCoverPath = Path.Combine(webRootPath, existingAlbum.CoverImagePath.TrimStart('/'));
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
            existingAlbum.CoverImagePath = $"/uploads/covers/{coverFileName}";
        }

        await _albumRepository.UpdateAsync(existingAlbum);
        return existingAlbum;
    }

    public async Task<bool> DeleteAlbumAsync(Guid id)
    {
        var album = await _albumRepository.GetByIdAsync(id);
        if (album == null)
        {
            return false;
        }

        await _albumRepository.DeleteAsync(album);
        return true;
    }

    public async Task<bool> AddTrackToAlbumAsync(Guid albumId, Guid trackId)
    {
        var album = await _albumRepository.GetByIdAsync(albumId);
        var track = await _trackRepository.GetByIdAsync(trackId);

        if (album == null || track == null)
        {
            return false;
        }

        track.AlbumId = albumId;
        track.Album = album.Name;
        await _trackRepository.UpdateAsync(track);
        return true;
    }

    public async Task<bool> RemoveTrackFromAlbumAsync(Guid albumId, Guid trackId)
    {
        var track = await _trackRepository.GetByIdAsync(trackId);
        if (track == null || track.AlbumId != albumId)
        {
            return false;
        }

        track.AlbumId = null;
        track.Album = null;
        await _trackRepository.UpdateAsync(track);
        return true;
    }
}

