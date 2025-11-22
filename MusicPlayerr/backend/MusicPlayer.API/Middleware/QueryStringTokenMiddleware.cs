namespace MusicPlayer.API.Middleware;

/// <summary>
/// Middleware to extract JWT token from query string and add it to Authorization header
/// This is needed for audio elements that can't send custom headers
/// </summary>
public class QueryStringTokenMiddleware
{
    private readonly RequestDelegate _next;

    public QueryStringTokenMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only process requests to stream endpoints
        if (context.Request.Path.StartsWithSegments("/api/stream"))
        {
            // Check if token is in query string
            var token = context.Request.Query["token"].FirstOrDefault();
            if (!string.IsNullOrEmpty(token) && !context.Request.Headers.ContainsKey("Authorization"))
            {
                // Add token to Authorization header
                context.Request.Headers.Authorization = $"Bearer {token}";
            }
        }

        await _next(context);
    }
}


