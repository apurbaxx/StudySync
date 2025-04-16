import React from 'react';
import { Button } from '@/components/ui/button';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';
import { formatTime } from '@/lib/utils';

export function TimerControl() {
  const { room, remainingTime, timerStart, timerPause, timerReset } = useRoom();
  const { user } = useUser();
  
  const isHost = user?.isHost ?? false;
  const isRunning = room?.timerState === 'running';
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Pomodoro Timer</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className={`${room?.timerMode === 'study' ? 'text-primary' : 'text-accent'} font-medium`}>
              {room?.timerMode === 'study' ? 'Study Session' : 'Break Time'}
            </span> · {formatTime(remainingTime)} remaining
          </p>
        </div>
        
        <div className="flex space-x-3">
          {isRunning ? (
            <Button 
              onClick={timerPause} 
              variant="secondary" 
              disabled={!isHost}
              className="px-4"
            >
              <i className="bx bx-pause mr-1"></i> Pause
            </Button>
          ) : (
            <Button 
              onClick={timerStart} 
              disabled={!isHost}
              className="px-4"
            >
              <i className="bx bx-play mr-1"></i> Start
            </Button>
          )}
          <Button 
            onClick={timerReset} 
            variant="secondary" 
            disabled={!isHost}
            className="px-4"
          >
            <i className="bx bx-refresh mr-1"></i> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
