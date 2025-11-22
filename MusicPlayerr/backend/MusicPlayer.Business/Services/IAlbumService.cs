using Microsoft.AspNetCore.Http;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Album service interface (Business Logic Layer)
/// </summary>
public interface IAlbumService
{
    Task<IEnumerable<Album>> GetAllAlbumsAsync(string? search);
    Task<Album?> GetAlbumByIdAsync(Guid id);
    Task<Album> CreateAlbumAsync(Album album, IFormFile? coverImage, string webRootPath);
    Task<Album?> UpdateAlbumAsync(Guid id, object updateDto, string webRootPath);
    Task<bool> DeleteAlbumAsync(Guid id);
    Task<bool> AddTrackToAlbumAsync(Guid albumId, Guid trackId);
    Task<bool> RemoveTrackFromAlbumAsync(Guid albumId, Guid trackId);
}

