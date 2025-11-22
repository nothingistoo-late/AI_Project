using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.API.DTOs;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Business.Services;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for album management (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlbumsController : ControllerBase
{
    private readonly IAlbumService _albumService;
    private readonly IWebHostEnvironment _environment;

    public AlbumsController(IAlbumService albumService, IWebHostEnvironment environment)
    {
        _albumService = albumService;
        _environment = environment;
    }

    /// <summary>
    /// Get all albums
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAlbums([FromQuery] string? search)
    {
        var albums = await _albumService.GetAllAlbumsAsync(search);
        return Ok(albums);
    }

    /// <summary>
    /// Get album by ID with tracks
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAlbum(Guid id)
    {
        var album = await _albumService.GetAlbumByIdAsync(id);
        if (album == null)
        {
            return NotFound();
        }
        return Ok(album);
    }

    /// <summary>
    /// Create a new album
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateAlbum([FromForm] CreateAlbumDto dto)
    {
        var album = new Album
        {
            Name = dto.Name,
            Artist = dto.Artist,
            Genre = dto.Genre
        };

        var webRootPath = _environment.WebRootPath ?? _environment.ContentRootPath;
        var createdAlbum = await _albumService.CreateAlbumAsync(album, dto.CoverImage, webRootPath);
        return CreatedAtAction(nameof(GetAlbum), new { id = createdAlbum.Id }, createdAlbum);
    }

    /// <summary>
    /// Update album
    /// </summary>
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateAlbum(Guid id, [FromForm] UpdateAlbumDto dto)
    {
        var webRootPath = _environment.WebRootPath ?? _environment.ContentRootPath;
        var updatedAlbum = await _albumService.UpdateAlbumAsync(id, dto, webRootPath);
        if (updatedAlbum == null)
        {
            return NotFound();
        }
        return Ok(updatedAlbum);
    }

    /// <summary>
    /// Delete album
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAlbum(Guid id)
    {
        var result = await _albumService.DeleteAlbumAsync(id);
        if (!result)
        {
            return NotFound();
        }
        return NoContent();
    }

    /// <summary>
    /// Add track to album
    /// </summary>
    [HttpPost("{id}/tracks/{trackId}")]
    public async Task<IActionResult> AddTrackToAlbum(Guid id, Guid trackId)
    {
        var result = await _albumService.AddTrackToAlbumAsync(id, trackId);
        if (!result)
        {
            return NotFound();
        }
        return Ok(new { message = "Track added to album" });
    }

    /// <summary>
    /// Remove track from album
    /// </summary>
    [HttpDelete("{id}/tracks/{trackId}")]
    public async Task<IActionResult> RemoveTrackFromAlbum(Guid id, Guid trackId)
    {
        var result = await _albumService.RemoveTrackFromAlbumAsync(id, trackId);
        if (!result)
        {
            return NotFound();
        }
        return Ok(new { message = "Track removed from album" });
    }
}
