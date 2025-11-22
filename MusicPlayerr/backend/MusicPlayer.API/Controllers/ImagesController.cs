using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace MusicPlayer.API.Controllers;

/// <summary>
/// Controller for serving image files (public access)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly IContentTypeProvider _contentTypeProvider;

    public ImagesController(IWebHostEnvironment environment)
    {
        _environment = environment;
        _contentTypeProvider = new FileExtensionContentTypeProvider();
    }

    /// <summary>
    /// Serve image file by path
    /// </summary>
    [HttpGet("{*filePath}")]
    [ResponseCache(Duration = 31536000)] // Cache for 1 year
    public IActionResult GetImage(string filePath)
    {
        // Security: Only allow files from uploads directory
        if (filePath.Contains("..") || !filePath.Replace("\\", "/").StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Invalid file path" });
        }

        // Normalize path separators
        filePath = filePath.Replace("\\", "/");
        
        // Try ContentRootPath first (where files are actually stored), then WebRootPath
        var contentRootPath = Path.Combine(_environment.ContentRootPath, filePath);
        var webRootPath = _environment.WebRootPath != null 
            ? Path.Combine(_environment.WebRootPath, filePath) 
            : null;
        
        string? fullPath = null;
        if (System.IO.File.Exists(contentRootPath))
        {
            fullPath = contentRootPath;
        }
        else if (webRootPath != null && System.IO.File.Exists(webRootPath))
        {
            fullPath = webRootPath;
        }
        
        if (fullPath == null)
        {
            return NotFound(new { message = $"Image not found. Tried: {contentRootPath}" + (webRootPath != null ? $", {webRootPath}" : "") });
        }

        if (!_contentTypeProvider.TryGetContentType(fullPath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        // Only allow image types
        if (!contentType.StartsWith("image/"))
        {
            return BadRequest(new { message = "File is not an image" });
        }

        var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        
        Response.Headers["Cache-Control"] = "public, max-age=31536000";
        Response.Headers["Access-Control-Allow-Origin"] = "*";
        
        return File(fileStream, contentType);
    }
}

