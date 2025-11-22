import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useState, useRef } from 'react';
import WaveformVisualizer from './WaveformVisualizer';
import RotatingDisc from './RotatingDisc';
import { getImageUrl } from '../services/api';

export default function PlayerModal() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    waveform,
    audioRef,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    formatTime,
    setIsMiniPlayer,
    showPlayerModal,
    setShowPlayerModal,
  } = usePlayer();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeTimeoutRef = useRef(null);

  if (!currentTrack || !showPlayerModal) {
    return null;
  }

  const handleClose = () => {
    setShowPlayerModal(false);
    setIsMiniPlayer(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Disc and Waveform Container */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {/* Rotating Disc */}
          <div className="flex-shrink-0">
            <RotatingDisc
              imageUrl={getImageUrl(currentTrack.coverImagePath) || '/default-album.png'}
              isPlaying={isPlaying}
              size={280}
            />
          </div>

          {/* Waveform Visualization - Vertical */}
          <div className="flex-1 h-80 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <WaveformVisualizer
              waveform={waveform}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={seek}
              audioElement={audioRef}
              isIntegrated={false}
              isVertical={true}
            />
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">{currentTrack.title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{currentTrack.artist}</p>
          {currentTrack.album && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{currentTrack.album}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seek(percent * duration);
            }}
          >
            <div
              className="h-full bg-primary-600 rounded-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={playPrevious}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={togglePlayPause}
            className="p-4 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-lg"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={playNext}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
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
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            {showVolumeSlider && (
              <div 
                className="absolute left-full top-0 ml-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10"
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
                  className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
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

