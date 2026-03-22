import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { X, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const AudioPlayerComponent = () => {
  const { currentTrack, isPlaying, stopTrack, nextTrack, previousTrack, playTrack, pauseTrack } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary shadow-lg z-40 animate-slideIn">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track info */}
          <div className="flex-shrink-0 hidden sm:block">
            {currentTrack.image && (
              <img 
                src={currentTrack.image} 
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
          </div>
          <div className="flex-shrink-0 min-w-0 max-w-[200px]">
            <h4 className="text-white font-medium text-sm truncate">{currentTrack.title}</h4>
            <p className="text-white/60 text-xs truncate">{currentTrack.artist || 'Conscience Soufie'}</p>
          </div>
          
          {/* Player */}
          <div className="flex-1">
            <AudioPlayer
              src={currentTrack.url}
              autoPlay={isPlaying}
              showSkipControls={false}
              showJumpControls={false}
              layout="horizontal-reverse"
              customProgressBarSection={['PROGRESS_BAR', 'CURRENT_TIME', 'DURATION']}
              customControlsSection={['MAIN_CONTROLS', 'VOLUME_CONTROLS']}
              onPlay={() => playTrack(currentTrack)}
              onPause={() => pauseTrack()}
              className="!bg-transparent !shadow-none !p-0"
            />
          </div>
          
          {/* Close button */}
          <button
            onClick={stopTrack}
            className="flex-shrink-0 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Fermer le lecteur"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerComponent;
