using Microsoft.AspNetCore.Http;
using MusicPlayer.Domain.Entities;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Track service interface (Business Logic Layer)
/// </summary>
public interface ITrackService
{
    Task<IEnumerable<Track>> GetAllTracksAsync(string? search, string? genre, Guid? albumId);
    Task<Track?> GetTrackByIdAsync(Guid id);
    Task<Track> CreateTrackAsync(Track track, IFormFile? coverImage, string webRootPath);
    Task<Track?> UpdateTrackAsync(Guid id, object updateDto, string webRootPath);
    Task<bool> DeleteTrackAsync(Guid id, string webRootPath);
    Task RecordPlaybackAsync(Guid trackId, Guid userId);
}

