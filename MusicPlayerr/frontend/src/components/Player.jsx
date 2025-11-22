import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Music } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import WaveformVisualizer from './WaveformVisualizer';
import RotatingDisc from './RotatingDisc';
import { getImageUrl } from '../services/api';

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    waveform,
    isMiniPlayer,
    audioRef,
    showPlayerModal,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    setIsMiniPlayer,
    formatTime,
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeTimeoutRef = useRef(null);
  const seekBarRef = useRef(null);

  if (!currentTrack || isMiniPlayer || showPlayerModal) {
    return null;
  }

  const handleSeek = (e) => {
    const rect = seekBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary-600 shadow-2xl z-50 rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Progress Bar with Integrated Waveform */}
        <div className="mb-4">
          <div
            ref={seekBarRef}
            className="h-1.5 bg-primary-700/50 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            {/* Waveform background */}
            <div className="absolute inset-0 opacity-30">
              <WaveformVisualizer 
                waveform={waveform} 
                currentTime={currentTime} 
                duration={duration} 
                isPlaying={isPlaying}
                onSeek={seek}
                audioElement={audioRef}
                isIntegrated={true}
              />
            </div>
            {/* Progress indicator */}
            <div
              className="h-full bg-white rounded-full transition-all relative z-10"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/80 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Album Cover */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {currentTrack.coverImagePath ? (
                <img
                  src={getImageUrl(currentTrack.coverImagePath)}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-6 h-6 text-white" />
              )}
            </div>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white truncate">{currentTrack.title}</h3>
            <p className="text-sm text-white/80 truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={playPrevious}
              className="p-2 rounded-full hover:bg-primary-700/50 text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-3 rounded-full bg-white hover:bg-white/90 text-primary-600 transition-colors shadow-lg"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={playNext}
              className="p-2 rounded-full hover:bg-primary-700/50 text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => {
              if (volumeTimeoutRef.current) {
                clearTimeout(volumeTimeoutRef.current);
                volumeTimeoutRef.current = null;
              }
              setShowVolumeSlider(true);
            }}
            onMouseLeave={() => {
              volumeTimeoutRef.current = setTimeout(() => {
                setShowVolumeSlider(false);
              }, 200);
            }}
          >
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-primary-700/50 text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            {showVolumeSlider && (
              <div 
                className="absolute left-full top-0 ml-2 p-3 bg-white rounded-lg shadow-lg z-10"
                onMouseEnter={() => {
                  if (volumeTimeoutRef.current) {
                    clearTimeout(volumeTimeoutRef.current);
                    volumeTimeoutRef.current = null;
                  }
                  setShowVolumeSlider(true);
                }}
                onMouseLeave={() => {
                  volumeTimeoutRef.current = setTimeout(() => {
                    setShowVolumeSlider(false);
                  }, 200);
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #16a34a 0%, #16a34a ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





