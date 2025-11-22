import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import Albums from './pages/Albums';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
import PlayerModal from './components/PlayerModal';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tracks" element={<Tracks />} />
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlists/:id" element={<PlaylistDetail />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
        <Player />
        <MiniPlayer />
        <PlayerModal />
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;





