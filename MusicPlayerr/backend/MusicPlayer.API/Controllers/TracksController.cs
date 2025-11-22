using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.API.DTOs;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Business.Services;
using System.Security.Claims;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for music track management (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TracksController : ControllerBase
{
    private readonly ITrackService _trackService;
    private readonly IWebHostEnvironment _environment;

    public TracksController(ITrackService trackService, IWebHostEnvironment environment)
    {
        _trackService = trackService;
        _environment = environment;
    }

    /// <summary>
    /// Get all tracks with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTracks([FromQuery] string? search, [FromQuery] string? genre, [FromQuery] Guid? albumId)
    {
        var tracks = await _trackService.GetAllTracksAsync(search, genre, albumId);
        return Ok(tracks);
    }

    /// <summary>
    /// Get track by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTrack(Guid id)
    {
        var track = await _trackService.GetTrackByIdAsync(id);
        if (track == null)
        {
            return NotFound();
        }
        return Ok(track);
    }

    /// <summary>
    /// Upload a new track
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadTrack([FromForm] UploadTrackDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        // Validate file type
        var allowedExtensions = new[] { ".mp3", ".wav", ".m4a", ".flac", ".ogg" };
        var fileExtension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new { message = "Invalid file type. Allowed: mp3, wav, m4a, flac, ogg" });
        }

        // Create uploads directory
        var uploadsDir = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "tracks");
        Directory.CreateDirectory(uploadsDir);

        // Save audio file
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.File.CopyToAsync(stream);
        }

        // Get duration using NAudio
        int duration = 0;
        try
        {
            using var audioFile = new NAudio.Wave.AudioFileReader(filePath);
            duration = (int)audioFile.TotalTime.TotalSeconds;
        }
        catch { }

        // Create track record
        var track = new Track
        {
            Title = dto.Title,
            Artist = dto.Artist,
            Album = dto.Album,
            AlbumId = dto.AlbumId,
            Genre = dto.Genre,
            Duration = duration,
            FilePath = $"/uploads/tracks/{fileName}"
        };

        var webRootPath = _environment.WebRootPath ?? _environment.ContentRootPath;
        var createdTrack = await _trackService.CreateTrackAsync(track, dto.CoverImage, webRootPath);
        return CreatedAtAction(nameof(GetTrack), new { id = createdTrack.Id }, createdTrack);
    }

    /// <summary>
    /// Update track metadata
    /// </summary>
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateTrack(Guid id, [FromForm] UpdateTrackDto dto)
    {
        var webRootPath = _environment.WebRootPath ?? _environment.ContentRootPath;
        var updatedTrack = await _trackService.UpdateTrackAsync(id, dto, webRootPath);
        if (updatedTrack == null)
        {
            return NotFound();
        }
        return Ok(updatedTrack);
    }

    /// <summary>
    /// Delete track
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTrack(Guid id)
    {
        var webRootPath = _environment.WebRootPath ?? _environment.ContentRootPath;
        var result = await _trackService.DeleteTrackAsync(id, webRootPath);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    /// <summary>
    /// Record track playback
    /// </summary>
    [HttpPost("{id}/play")]
    public async Task<IActionResult> RecordPlayback(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        await _trackService.RecordPlaybackAsync(id, userId);
        return Ok(new { message = "Playback recorded" });
    }
}
