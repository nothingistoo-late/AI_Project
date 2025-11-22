using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MusicPlayer.Domain.Entities;
using MusicPlayer.Data.Repositories;

namespace MusicPlayer.Business.Services;

/// <summary>
/// Service for handling authentication and JWT token generation (Business Logic Layer)
/// </summary>
public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    public async Task<AuthResult?> RegisterAsync(string username, string email, string password)
    {
        // Check if username or email already exists
        var existingUser = await _userRepository.GetByUsernameOrEmailAsync(username);
        if (existingUser != null)
        {
            return null;
        }

        existingUser = await _userRepository.GetByEmailAsync(email);
        if (existingUser != null)
        {
            return null;
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

        // Create user
        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = passwordHash,
            Role = "User"
        };

        await _userRepository.AddAsync(user);

        // Generate token
        var token = GenerateJwtToken(user);

        return new AuthResult
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role
        };
    }

    /// <summary>
    /// Login user and return JWT token
    /// </summary>
    public async Task<AuthResult?> LoginAsync(string username, string password)
    {
        var user = await _userRepository.GetByUsernameAsync(username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        var token = GenerateJwtToken(user);

        return new AuthResult
        {
            Token = token,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role
        };
    }

    /// <summary>
    /// Generate JWT token for user
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _configuration["Jwt:Issuer"] ?? "MusicPlayerAPI",
            Audience = _configuration["Jwt:Audience"] ?? "MusicPlayerClient",
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

/// <summary>
/// Result object for authentication operations
/// </summary>
public class AuthResult
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
