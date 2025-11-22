import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { tracksAPI, streamAPI } from '../services/api';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [waveform, setWaveform] = useState([]);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  const audioRef = useRef(null);

  // Load waveform when track changes
  useEffect(() => {
    if (currentTrack) {
      setWaveform([]); // Clear previous waveform
      // Request more samples (300) to ensure full track coverage
      streamAPI.getWaveform(currentTrack.id, 300)
        .then(response => {
          if (response.data && response.data.waveform) {
            const waveformData = response.data.waveform;
            // Ensure waveform has data for entire track
            if (waveformData.length > 0) {
              setWaveform(waveformData);
            } else {
              console.warn('Empty waveform data received');
              setWaveform([]);
            }
          } else {
            console.warn('No waveform data received');
            setWaveform([]);
          }
        })
        .catch((error) => {
          console.error('Failed to load waveform:', error);
          setWaveform([]);
        });
    } else {
      setWaveform([]);
    }
  }, [currentTrack]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const playTrack = async (track, trackList = []) => {
    if (!track || !track.id) return;

    // Check if the clicked track is the same as the currently playing track
    if (currentTrack && currentTrack.id === track.id) {
      // If same track, just show the modal
      setShowPlayerModal(true);
      return;
    }

    // If different track, play the new track
    setCurrentTrack(track);
    setQueue(trackList.length > 0 ? trackList : [track]);
    setShowPlayerModal(true); // Show modal when track starts
    
    if (audioRef.current) {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Use fetch with Authorization header to get blob URL (better than query string)
      try {
        const audioUrl = streamAPI.getAudioUrl(track.id);
        console.log('Playing track:', track.title);
        
        // Fetch audio with Authorization header
        const response = await fetch(audioUrl, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Create blob URL from response
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        // Ensure audioRef is available
        if (!audioRef.current) {
          console.error('Audio ref is not available');
          setIsPlaying(false);
          return;
        }
        
        // Clean up previous blob URL if exists
        if (audioRef.current._blobUrl) {
          URL.revokeObjectURL(audioRef.current._blobUrl);
        }
        
        audioRef.current._blobUrl = blobUrl;
        audioRef.current.src = blobUrl;
        audioRef.current.load(); // Force reload
        
        // Wait for audio to be ready
        audioRef.current.addEventListener('canplay', () => {
          setIsPlaying(true);
          audioRef.current.play().catch(err => {
            console.error('Failed to play audio:', err);
            setIsPlaying(false);
          });
        }, { once: true });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio error:', e, 'Track:', track);
          setIsPlaying(false);
        });
        
        // Record playback
        try {
          await tracksAPI.recordPlayback(track.id);
        } catch (error) {
          console.error('Failed to record playback:', error);
        }
      } catch (error) {
        console.error('Failed to load audio:', error);
        setIsPlaying(false);
      }
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    playTrack(queue[nextIndex], queue);
  };

  const playPrevious = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    playTrack(queue[prevIndex], queue);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(currentTime + 5, duration));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(currentTime - 5, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, duration, volume]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        waveform,
        isMiniPlayer,
        audioRef,
        playTrack,
        playNext,
        playPrevious,
        togglePlayPause,
        seek,
        setVolume,
        toggleMute,
        setIsMiniPlayer,
        formatTime,
        showPlayerModal,
        setShowPlayerModal,
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
    </PlayerContext.Provider>
  );
};





