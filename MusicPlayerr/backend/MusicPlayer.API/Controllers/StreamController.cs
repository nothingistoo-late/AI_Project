using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MusicPlayer.Data.Repositories;
using MusicPlayer.Business.Services;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for audio streaming and waveform generation (Presentation Layer)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StreamController : ControllerBase
{
    private readonly ITrackRepository _trackRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly WaveformService _waveformService;

    public StreamController(ITrackRepository trackRepository, IWebHostEnvironment environment, WaveformService waveformService)
    {
        _trackRepository = trackRepository;
        _environment = environment;
        _waveformService = waveformService;
    }

    /// <summary>
    /// Stream audio file
    /// </summary>
    [HttpGet("audio/{id}")]
    public async Task<IActionResult> StreamAudio(Guid id)
    {
        var track = await _trackRepository.GetByIdAsync(id);
        if (track == null || string.IsNullOrEmpty(track.FilePath))
        {
            return NotFound(new { message = "Track not found" });
        }

        var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, track.FilePath.TrimStart('/'));
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = $"Audio file not found at: {filePath}" });
        }

        var contentType = GetContentType(filePath);
        var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        
        Response.Headers["Accept-Ranges"] = "bytes";
        Response.Headers["Content-Disposition"] = $"inline; filename=\"{Path.GetFileName(filePath)}\"";
        Response.Headers["Cache-Control"] = "public, max-age=3600";
        
        return File(fileStream, contentType, enableRangeProcessing: true);
    }

    /// <summary>
    /// Get waveform data for track
    /// </summary>
    [HttpGet("waveform/{id}")]
    public async Task<IActionResult> GetWaveform(Guid id, [FromQuery] int samples = 200)
    {
        var track = await _trackRepository.GetByIdAsync(id);
        if (track == null)
        {
            return NotFound();
        }

        var filePath = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, track.FilePath.TrimStart('/'));
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = "Audio file not found" });
        }

        var waveform = _waveformService.GenerateWaveform(filePath, samples);
        return Ok(new { waveform });
    }

    /// <summary>
    /// Get content type based on file extension
    /// </summary>
    private string GetContentType(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLowerInvariant();
        return extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".flac" => "audio/flac",
            ".ogg" => "audio/ogg",
            _ => "application/octet-stream"
        };
    }
}
