import React, { useEffect, useRef } from 'react';
import { useRoom } from '@/context/RoomContext';
import { formatTime } from '@/lib/utils';

export function PomodoroTimer() {
  const { room, remainingTime } = useRoom();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate progress circle
  useEffect(() => {
    if (!svgRef.current || !room) return;
    
    const circle = svgRef.current.querySelector('.timer-progress');
    if (!circle) return;
    
    const circumference = 2 * Math.PI * 80; // r = 80
    const totalTime = room.timerMode === 'study' ? room.studyDuration : room.breakDuration;
    const progress = (totalTime - remainingTime) / totalTime;
    
    const dashOffset = circumference * (1 - progress);
    circle.setAttribute('stroke-dasharray', String(circumference));
    circle.setAttribute('stroke-dashoffset', String(dashOffset));
    
    // Update class for color
    if (room.timerMode === 'break') {
      circle.classList.add('break');
    } else {
      circle.classList.remove('break');
    }
  }, [remainingTime, room]);
  
  return (
    <div className="pomodoro-timer">
      <svg width="180" height="180" viewBox="0 0 180 180" ref={svgRef}>
        <circle 
          className="timer-background" 
          cx="90" 
          cy="90" 
          r="80" 
        />
        <circle 
          className="timer-progress"
          cx="90" 
          cy="90" 
          r="80" 
          strokeDasharray="502" 
          strokeDashoffset="0" 
        />
        <text 
          x="90" 
          y="90" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="currentColor" 
          fontSize="28" 
          fontWeight="600" 
          className="timer-text"
        >
          {formatTime(remainingTime)}
        </text>
        <text 
          x="90" 
          y="115" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fill="currentColor" 
          fontSize="12" 
          className="timer-label"
        >
          {room?.timerMode === 'study' ? 'STUDY TIME' : 'BREAK TIME'}
        </text>
      </svg>
    </div>
  );
}
