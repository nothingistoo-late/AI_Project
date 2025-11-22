# Nguyên Lý Upload Nhạc Trong Project

## Tổng Quan
Project này sử dụng kiến trúc 3 lớp (3-Layer Architecture) để xử lý upload nhạc:
- **Presentation Layer (API)**: Nhận request từ frontend
- **Business Layer (Services)**: Xử lý logic nghiệp vụ
- **Data Layer (Repositories)**: Tương tác với database

## Quy Trình Upload Nhạc

### 1. Frontend (React)
**File**: `frontend/src/pages/Tracks.jsx`

```javascript
// User chọn file và điền thông tin
const handleUpload = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('file', uploadForm.file);
  formData.append('title', uploadForm.title);
  formData.append('artist', uploadForm.artist);
  formData.append('album', uploadForm.album);
  formData.append('genre', uploadForm.genre);
  if (uploadForm.coverImage) {
    formData.append('coverImage', uploadForm.coverImage);
  }
  
  // Gửi request đến API
  await tracksAPI.upload(formData);
};
```

**Điểm quan trọng**:
- Sử dụng `FormData` để gửi file (multipart/form-data)
- File audio và cover image được gửi cùng metadata (title, artist, album, genre)

### 2. API Layer (ASP.NET Core)
**File**: `backend/MusicPlayer.API/Controllers/TracksController.cs`

```csharp
[HttpPost]
[Consumes("multipart/form-data")]
public async Task<IActionResult> UploadTrack([FromForm] UploadTrackDto dto)
{
    // 1. Validate file
    if (dto.File == null || dto.File.Length == 0)
        return BadRequest("No file uploaded");
    
    // 2. Kiểm tra định dạng file (mp3, wav, m4a, flac, ogg)
    var allowedExtensions = new[] { ".mp3", ".wav", ".m4a", ".flac", ".ogg" };
    
    // 3. Tạo thư mục lưu trữ
    var uploadsDir = Path.Combine(webRootPath, "uploads", "tracks");
    Directory.CreateDirectory(uploadsDir);
    
    // 4. Lưu file với tên unique (Guid)
    var fileName = $"{Guid.NewGuid()}{fileExtension}";
    var filePath = Path.Combine(uploadsDir, fileName);
    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await dto.File.CopyToAsync(stream);
    }
    
    // 5. Đọc duration bằng NAudio
    int duration = 0;
    using var audioFile = new NAudio.Wave.AudioFileReader(filePath);
    duration = (int)audioFile.TotalTime.TotalSeconds;
    
    // 6. Tạo Track entity và gọi Business Layer
    var track = new Track { ... };
    var createdTrack = await _trackService.CreateTrackAsync(track, dto.CoverImage, webRootPath);
}
```

**Điểm quan trọng**:
- `[Consumes("multipart/form-data")]` để nhận file upload
- `[FromForm]` để bind dữ liệu từ form
- File được lưu với tên unique (Guid) để tránh trùng lặp
- Sử dụng `NAudio` để đọc metadata (duration) từ file audio

### 3. Business Layer (Services)
**File**: `backend/MusicPlayer.Business/Services/TrackService.cs`

```csharp
public async Task<Track> CreateTrackAsync(Track track, IFormFile? coverImage, string webRootPath)
{
    // 1. Xử lý cover image nếu có
    if (coverImage != null && coverImage.Length > 0)
    {
        var coverDir = Path.Combine(webRootPath, "uploads", "covers");
        Directory.CreateDirectory(coverDir);
        var coverFileName = $"{Guid.NewGuid()}{coverExtension}";
        // Lưu cover image
        track.CoverImagePath = $"/uploads/covers/{coverFileName}";
    }
    
    // 2. Lưu track vào database qua Repository
    return await _trackRepository.AddAsync(track);
}
```

**Điểm quan trọng**:
- Business Layer không phụ thuộc vào ASP.NET Core interfaces (`IWebHostEnvironment`)
- Nhận `webRootPath` như một string để tách biệt concerns
- Xử lý cover image tương tự như audio file

### 4. Data Layer (Repositories)
**File**: `backend/MusicPlayer.Data/Repositories/TrackRepository.cs`

```csharp
public async Task<Track> AddAsync(Track entity)
{
    await _dbSet.AddAsync(entity);
    await _context.SaveChangesAsync();
    return entity;
}
```

**Điểm quan trọng**:
- Repository chỉ quan tâm đến database operations
- Sử dụng Entity Framework Core để lưu vào database

## Cấu Trúc Thư Mục Lưu Trữ

```
backend/MusicPlayer.API/
├── wwwroot/              (WebRootPath)
│   └── uploads/
│       ├── tracks/       (Audio files)
│       │   └── {guid}.mp3
│       └── covers/      (Cover images)
│           └── {guid}.jpg
```

## Database Schema

**Track Entity**:
- `Id` (Guid): Primary key
- `Title` (string): Tên bài hát
- `Artist` (string): Nghệ sĩ
- `Album` (string): Album
- `Genre` (string): Thể loại
- `Duration` (int): Thời lượng (giây)
- `FilePath` (string): Đường dẫn file audio (`/uploads/tracks/{guid}.mp3`)
- `CoverImagePath` (string?): Đường dẫn cover image
- `PlayCount` (int): Số lần phát

## Streaming Audio

**File**: `backend/MusicPlayer.API/Controllers/StreamController.cs`

```csharp
[HttpGet("audio/{id}")]
public async Task<IActionResult> StreamAudio(Guid id)
{
    // 1. Lấy track từ database
    var track = await _trackRepository.GetByIdAsync(id);
    
    // 2. Đọc file từ disk
    var filePath = Path.Combine(webRootPath, track.FilePath.TrimStart('/'));
    var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
    
    // 3. Trả về file với range support (cho phép seek)
    Response.Headers["Accept-Ranges"] = "bytes";
    return File(fileStream, contentType, enableRangeProcessing: true);
}
```

**Điểm quan trọng**:
- `enableRangeProcessing: true` cho phép browser seek trong audio
- File được stream trực tiếp từ disk, không load toàn bộ vào memory

## Waveform Generation

**File**: `backend/MusicPlayer.Business/Services/WaveformService.cs`

```csharp
public float[] GenerateWaveform(string audioFilePath, int samples)
{
    // 1. Đọc audio file bằng NAudio
    using var audioFile = new AudioFileReader(audioFilePath);
    
    // 2. Tính toán RMS (Root Mean Square) cho mỗi sample
    // RMS cho giá trị amplitude chính xác hơn maxAmplitude
    
    // 3. Normalize values về range 0.1f - 1.0f
    // Đảm bảo waveform luôn có variation, không bị flat
    
    // 4. Trả về array các giá trị amplitude
    return waveform;
}
```

**Điểm quan trọng**:
- Sử dụng RMS thay vì maxAmplitude để có waveform tự nhiên hơn
- Normalize để đảm bảo waveform luôn có variation
- Đọc toàn bộ file để đảm bảo có waveform cho cả bài hát

## Security & Authentication

1. **JWT Authentication**: Tất cả endpoints đều yêu cầu `[Authorize]`
2. **File Validation**: Chỉ chấp nhận các định dạng audio hợp lệ
3. **User Isolation**: Mỗi user chỉ thấy và quản lý tracks của mình (trong tương lai)

## Performance Considerations

1. **File Size Limit**: Kestrel được cấu hình `MaxRequestBodySize = 500MB`
2. **Request Buffering**: `context.Request.EnableBuffering()` để xử lý file lớn
3. **Streaming**: Audio được stream, không load toàn bộ vào memory
4. **Range Requests**: Hỗ trợ HTTP Range để seek trong audio

## Tóm Tắt

1. **Frontend** → Gửi FormData với file và metadata
2. **API Controller** → Validate, lưu file, đọc duration, tạo Track entity
3. **Business Service** → Xử lý cover image, gọi repository
4. **Repository** → Lưu vào database
5. **Streaming** → Phục vụ audio file với range support
6. **Waveform** → Generate waveform data từ audio file


