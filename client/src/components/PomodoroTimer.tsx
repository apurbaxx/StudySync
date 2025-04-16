import React from 'react';
import { useRoom } from '@/context/RoomContext';
import { formatTime } from '@/lib/utils';

export function PomodoroTimer() {
  const { room, remainingTime } = useRoom();
  
  // Format for the digital clock display
  const formattedTime = formatTime(remainingTime);
  const hours = formattedTime.split(':')[0];
  const minutes = formattedTime.split(':')[1];
  const seconds = formattedTime.split(':')[2];
  
  return (
    <div className="flex items-center justify-center">
      <div className="digital-clock text-5xl font-bold font-mono text-white tracking-wider">
        <span>{hours}</span>
        <span className="opacity-80">:</span>
        <span>{minutes}</span>
        <span className="opacity-80">:</span>
        <span>{seconds}</span>
      </div>
    </div>
  );
}
