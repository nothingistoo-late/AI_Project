import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Maximize2, X } from 'lucide-react';
import RotatingDisc from './RotatingDisc';
import WaveformVisualizer from './WaveformVisualizer';
import { getImageUrl } from '../services/api';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, isMiniPlayer, togglePlayPause, setIsMiniPlayer, formatTime, currentTime, duration, waveform, seek, audioRef } = usePlayer();

  if (!currentTrack || !isMiniPlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80 z-50">
      <div className="flex items-center gap-4 mb-3">
        <RotatingDisc
          imageUrl={getImageUrl(currentTrack.coverImagePath) || '/default-album.png'}
          isPlaying={isPlaying}
          size={60}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentTrack.artist}</p>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMiniPlayer(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Waveform in Mini Player */}
      <div className="h-16 mb-2">
        <WaveformVisualizer 
          waveform={waveform} 
          currentTime={currentTime} 
          duration={duration} 
          isPlaying={isPlaying}
          onSeek={seek}
          audioElement={audioRef}
        />
      </div>
    </div>
  );
}





