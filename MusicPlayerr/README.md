# Music Player - Fullstack Application

A production-ready fullstack music application with .NET 8 backend API and ReactJS frontend.

## Architecture

### Backend (3-Layer Architecture)
- **Presentation Layer**: Controllers (API endpoints)
- **Business Logic Layer**: Services (business rules and logic)
- **Data Access Layer**: Repositories (database operations)

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- Context API for state management

## Features

### Backend
- ✅ JWT Authentication (Register, Login, Logout)
- ✅ User Management with Roles (User, Admin)
- ✅ Music Track CRUD operations
- ✅ Album Management
- ✅ Playlist Management
- ✅ Audio Streaming
- ✅ Waveform Generation
- ✅ Search & Filter
- ✅ Playback History
- ✅ Admin Analytics

### Frontend
- ✅ Authentication UI (Login/Register)
- ✅ Music Player with controls (Play, Pause, Skip, Seek, Volume)
- ✅ Waveform Visualization
- ✅ Rotating Disc Animation
- ✅ Mini Player Mode
- ✅ Album & Playlist Management
- ✅ Track Upload
- ✅ Search & Filter UI
- ✅ Dark/Light Theme
- ✅ Keyboard Shortcuts
- ✅ Responsive Design

## Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or full instance)

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend/MusicPlayer.API
```

2. Update connection string in `appsettings.json` if needed

3. Restore packages and run:
```bash
dotnet restore
dotnet run
```

The API will run on `http://localhost:5000` (or configured port)

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
MusicPlayerr/
├── backend/
│   └── MusicPlayer.API/
│       ├── Controllers/          # Presentation Layer
│       ├── Services/             # Business Logic Layer
│       ├── Repositories/         # Data Access Layer
│       ├── Models/               # Entity Models
│       ├── DTOs/                 # Data Transfer Objects
│       └── Data/                 # DbContext
└── frontend/
    └── src/
        ├── components/           # React Components
        ├── pages/                # Page Components
        ├── context/              # Context Providers
        └── services/             # API Services
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/{id}` - Get track by ID
- `POST /api/tracks` - Upload new track
- `PUT /api/tracks/{id}` - Update track
- `DELETE /api/tracks/{id}` - Delete track
- `POST /api/tracks/{id}/play` - Record playback

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/{id}` - Get album by ID
- `POST /api/albums` - Create album
- `PUT /api/albums/{id}` - Update album
- `DELETE /api/albums/{id}` - Delete album

### Playlists
- `GET /api/playlists` - Get user playlists
- `GET /api/playlists/{id}` - Get playlist by ID
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/{id}` - Update playlist
- `DELETE /api/playlists/{id}` - Delete playlist

### Streaming
- `GET /api/stream/audio/{id}` - Stream audio file
- `GET /api/stream/waveform/{id}` - Get waveform data

### Search
- `GET /api/search?q={query}` - Search tracks and albums
- `GET /api/search/genres` - Get all genres

### History
- `GET /api/history` - Get playback history
- `GET /api/history/recent` - Get recent tracks

### Analytics (Admin only)
- `GET /api/analytics/top-tracks` - Get top tracks
- `GET /api/analytics/top-albums` - Get top albums
- `GET /api/analytics/recent-uploads` - Get recent uploads
- `GET /api/analytics/user-stats` - Get user statistics

## Keyboard Shortcuts

- `Space` - Play/Pause
- `Arrow Left` - Seek backward 5 seconds
- `Arrow Right` - Seek forward 5 seconds
- `Arrow Up` - Increase volume
- `Arrow Down` - Decrease volume

## Default Admin User

To create an admin user, you can manually update the database or use the API to register and then update the role in the database.

## License

MIT






