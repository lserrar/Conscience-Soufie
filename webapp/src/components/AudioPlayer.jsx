import React from 'react';
import AudioPlayerLib from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const AudioPlayer = () => {
  const { currentTrack, isPlaying, stopTrack, playTrack, pauseTrack } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 bg-[#1c679f] shadow-lg z-30">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex-shrink-0">
          {currentTrack.image && (
            <img 
              src={currentTrack.image} 
              alt={currentTrack.title}
              className="w-10 h-10 rounded object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-xs truncate">{currentTrack.title}</h4>
        </div>
        
        <div className="flex-shrink-0 w-32">
          <AudioPlayerLib
            src={currentTrack.url}
            autoPlay={isPlaying}
            showSkipControls={false}
            showJumpControls={false}
            layout="horizontal-reverse"
            customProgressBarSection={[]}
            customControlsSection={['MAIN_CONTROLS']}
            onPlay={() => playTrack(currentTrack)}
            onPause={() => pauseTrack()}
            className="mini-player !bg-transparent !shadow-none !p-0"
          />
        </div>
        
        <button
          onClick={stopTrack}
          className="flex-shrink-0 p-1.5 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        .mini-player .rhap_container {
          padding: 0 !important;
          background: transparent !important;
        }
        .mini-player .rhap_main-controls-button {
          color: white !important;
          width: 32px !important;
          height: 32px !important;
        }
        .mini-player .rhap_play-pause-button {
          font-size: 28px !important;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;
