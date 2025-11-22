import { useRef, useEffect, useState } from 'react';

export default function WaveformVisualizer({ waveform, currentTime, duration, isPlaying = false, onSeek, audioElement, isIntegrated = false, isVertical = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 64 });
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  // Handle click to seek
  const handleClick = (e) => {
    if (!onSeek || !duration) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (isVertical) {
      // For vertical waveform, seek based on Y position
      const percent = (e.clientY - rect.top) / rect.height;
      const seekTime = percent * duration;
      onSeek(seekTime);
    } else {
      // For horizontal waveform, seek based on X position
      const percent = (e.clientX - rect.left) / rect.width;
      const seekTime = percent * duration;
      onSeek(seekTime);
    }
  };

  // Initialize Web Audio API for real-time waveform
  useEffect(() => {
    if (!audioElement || !audioElement.current) return;

    // Check if audio element is already connected
    if (audioElement.current._audioContextConnected) {
      // Reuse existing connection
      return;
    }

    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256; // Higher FFT size for more detail
      analyserRef.current.smoothingTimeConstant = 0.8; // Smooth transitions
      
      // Create data array
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Connect audio element to analyser (only once)
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Mark as connected to prevent reconnection
      audioElement.current._audioContextConnected = true;
      audioElement.current._audioContext = audioContextRef.current;
      audioElement.current._analyser = analyserRef.current;
      
      return () => {
        // Don't disconnect on cleanup - let it persist for the audio element's lifetime
        // The audio element will handle its own cleanup
      };
    } catch (error) {
      console.error('Error initializing Web Audio API:', error);
      // If already connected, try to reuse existing analyser
      if (audioElement.current._analyser) {
        analyserRef.current = audioElement.current._analyser;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      }
    }
  }, [audioElement]);

  // Update canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Real-time waveform animation using Web Audio API
  useEffect(() => {
    // Try to get analyser from audio element if not set
    if (!analyserRef.current && audioElement?.current?._analyser) {
      analyserRef.current = audioElement.current._analyser;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }
    
    if (!isPlaying || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvasSize.width;
    const height = canvasSize.height;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = dataArray.length;
    const barCount = Math.min(bufferLength, 128); // Use 128 bars for smooth visualization
    
    const animate = () => {
      if (!isPlaying) return;

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (isVertical) {
        // Vertical bars - arranged horizontally, each bar extends from bottom to top
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          // Sample data points for smoother visualization
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const dataValue = dataArray[dataIndex];
          
          // Normalize to 0-1 range and amplify for remix effect
          const normalizedValue = dataValue / 255;
          // Amplify: when sound is loud, bars jump high (remix style)
          const amplifiedValue = Math.pow(normalizedValue, 0.7); // Power curve for more dynamic range
          const barHeight = Math.max(2, amplifiedValue * height * 0.95); // Max 95% of height, minimum 2px
          // Position bars horizontally, but each bar extends from bottom to top
          const x = i * barWidth;
          const y = height - barHeight; // Bars start from bottom, extend upward

          // Unified green/white color for all bars (light for integrated mode)
          const gradient = ctx.createLinearGradient(x, 0, x, height);
          if (isIntegrated) {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#dcfce7');
          } else {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#4ade80');
          }
          ctx.fillStyle = gradient;

          // Draw rounded rectangle bar (vertical - extends upward)
          const radius = Math.max(1, barWidth / 4);
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, y + barHeight - radius);
          ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
          ctx.lineTo(x + radius, y + barHeight);
          ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // Horizontal bars - original implementation
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
          // Sample data points for smoother visualization
          const dataIndex = Math.floor((i / barCount) * bufferLength);
          const dataValue = dataArray[dataIndex];
          
          // Normalize to 0-1 range and amplify for remix effect
          const normalizedValue = dataValue / 255;
          // Amplify: when sound is loud, bars jump high (remix style)
          const amplifiedValue = Math.pow(normalizedValue, 0.7); // Power curve for more dynamic range
          const barHeight = Math.max(4, amplifiedValue * height * 0.95); // Max 95% of height, minimum 4px
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          // Unified green/white color for all bars (light for integrated mode)
          const gradient = ctx.createLinearGradient(x, 0, x, height);
          if (isIntegrated) {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#dcfce7');
          } else {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#4ade80');
          }
          ctx.fillStyle = gradient;

          // Draw rounded rectangle bar
          const radius = Math.max(1, barWidth / 4);
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, y + barHeight - radius);
          ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
          ctx.lineTo(x + radius, y + barHeight);
          ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }

        // Draw progress line (only if not integrated)
        if (!isIntegrated) {
          const currentPercent = duration > 0 ? currentTime / duration : 0;
          const progressX = currentPercent * width;
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#22c55e';
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(progressX, 0);
          ctx.lineTo(progressX, height);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, canvasSize]);

  // Fallback: Draw static waveform when not playing
  useEffect(() => {
    if (isPlaying || !waveform || waveform.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvasSize.width;
    const height = canvasSize.height;
    
    // Ensure we draw all waveform points, even if waveform.length is less than expected
    const totalBars = waveform.length;
    const currentPercent = duration > 0 ? currentTime / duration : 0;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (isVertical) {
      // Vertical bars - arranged horizontally, each bar extends from bottom to top
      const barWidth = totalBars > 0 ? Math.max(1, width / totalBars) : 1;
      
      // Draw static waveform bars - all green (vertical)
      for (let index = 0; index < totalBars; index++) {
        const amplitude = waveform[index] || 0.1; // Use minimum if undefined
        const normalizedAmplitude = Math.max(0.15, Math.min(1.0, amplitude));
        const barHeight = Math.max(2, normalizedAmplitude * height * 0.95); // Minimum 2px height, max 95% of height
        // Position bars horizontally, but each bar extends from bottom to top
        const x = index * barWidth;
        const y = height - barHeight; // Bars start from bottom, extend upward

        // Unified green/white color for all bars (light for integrated mode)
        const gradient = ctx.createLinearGradient(x, 0, x, height);
        if (isIntegrated) {
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#dcfce7');
        } else {
          gradient.addColorStop(0, '#22c55e');
          gradient.addColorStop(1, '#4ade80');
        }
        ctx.fillStyle = gradient;

        // Draw rounded rectangle (vertical - extends upward)
        const radius = Math.max(1, barWidth / 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Horizontal bars - original implementation
      const barWidth = totalBars > 0 ? Math.max(1, width / totalBars) : 1;
      
      // Draw static waveform bars - all green
      // Ensure we draw all bars from start to end
      for (let index = 0; index < totalBars; index++) {
        const amplitude = waveform[index] || 0.1; // Use minimum if undefined
        const normalizedAmplitude = Math.max(0.15, Math.min(1.0, amplitude));
        const barHeight = Math.max(5, normalizedAmplitude * height * 0.95); // Minimum 5px height, max 95% of height
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

        // Unified green/white color for all bars (light for integrated mode)
        const gradient = ctx.createLinearGradient(x, 0, x, height);
        if (isIntegrated) {
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, '#dcfce7');
      } else {
          gradient.addColorStop(0, '#22c55e');
          gradient.addColorStop(1, '#4ade80');
        }
        ctx.fillStyle = gradient;

        // Draw rounded rectangle
        const radius = Math.max(1, barWidth / 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }

      // Draw progress line (only if not integrated)
      if (!isIntegrated) {
    const progressX = currentPercent * width;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#22c55e';
        ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }, [waveform, currentTime, duration, canvasSize, isPlaying, isVertical]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full rounded overflow-hidden ${!isIntegrated ? 'cursor-pointer' : ''}`}
      onClick={!isIntegrated ? handleClick : undefined}
      title={!isIntegrated ? "Click to seek" : undefined}
    >
    <canvas
      ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}





