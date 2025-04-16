import React from 'react';
import { Button } from '@/components/ui/button';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';
import { formatTime } from '@/lib/utils';

export function TimerControl() {
  const { room, remainingTime, timerStart, timerPause, timerReset, timerToggleMode } = useRoom();
  const { user } = useUser();
  
  const isHost = user?.isHost ?? false;
  const isRunning = room?.timerState === 'running';
  
  // This component is no longer directly used in the new design
  // The timer controls are integrated directly into the StudyRoom component
  return (
    <div className="flex justify-center space-x-2">
      {isRunning ? (
        <Button 
          onClick={timerPause} 
          variant="ghost" 
          disabled={!isHost}
          size="sm" 
          className="bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </Button>
      ) : (
        <Button 
          onClick={timerStart} 
          disabled={!isHost}
          variant="ghost" 
          size="sm" 
          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="10 8 16 12 10 16 10 8"></polygon>
          </svg>
        </Button>
      )}
      <Button 
        onClick={timerReset} 
        variant="ghost" 
        disabled={!isHost}
        size="sm" 
        className="bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <rect x="9" y="9" width="6" height="6"></rect>
        </svg>
      </Button>
      <Button
        onClick={timerToggleMode}
        variant="ghost" 
        disabled={!isHost}
        size="sm" 
        className="bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a10 10 0 1 0-9-12h9z"></path>
        </svg>
      </Button>
    </div>
  );
}
