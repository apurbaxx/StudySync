import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MemberList } from '@/components/MemberList';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TimerControl } from '@/components/TimerControl';
import { Chat } from '@/components/Chat';
import { StatusSelector } from '@/components/StatusSelector';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';
import { getInitials } from '@/lib/utils';

interface StudyRoomProps {
  onLeaveRoom: () => void;
}

export function StudyRoom({ onLeaveRoom }: StudyRoomProps) {
  const { room, leaveRoom } = useRoom();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLeaveRoom = () => {
    leaveRoom();
    onLeaveRoom();
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar - Members & Room Info */}
      <div 
        className={`w-full md:w-80 bg-white dark:bg-gray-800 shadow-md md:h-screen overflow-y-auto z-20 transition-all duration-300 ${
          sidebarOpen ? '' : 'hidden md:block'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">StudyHub</h1>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <i className="bx bx-hash mr-1"></i> 
                <span id="room-code">{room?.id}</span>
              </div>
            </div>
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 dark:text-gray-400"
              aria-label="Toggle sidebar"
            >
              <i className="bx bx-menu text-2xl"></i>
            </button>
          </div>
          
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {room?.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {room?.topic}
            </p>
          </div>
        </div>
        
        {/* Room Members */}
        <MemberList />
        
        {/* User Status */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {getInitials(user?.username || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {user?.username}
                </p>
                <StatusSelector />
              </div>
            </div>
            
            <Button 
              onClick={handleLeaveRoom} 
              variant="ghost" 
              className="text-sm text-red-500 hover:text-red-700 hover:bg-transparent"
            >
              Leave
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Timer Section */}
        <TimerControl />
        
        {/* Timer and Chat Container */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col md:flex-row gap-4">
          {/* Timer Visualization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center md:w-1/3">
            <PomodoroTimer />
            
            {/* Session Stats */}
            <div className="mt-6 w-full">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Sessions Completed</span>
                <span className="font-medium text-gray-800 dark:text-white">0</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Total Study Time</span>
                <span className="font-medium text-gray-800 dark:text-white">0m</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Current Mode</span>
                <span className={`font-medium ${room?.timerMode === 'study' ? 'text-primary' : 'text-accent'}`}>
                  {room?.timerMode === 'study' ? 'Study' : 'Break'}
                </span>
              </div>
            </div>
            
            {/* Optional: Music Controls */}
            <div className="mt-6 w-full border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Background Music</h3>
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg py-2 text-gray-700 dark:text-gray-300 transition-colors">
                <i className="bx bx-music text-lg"></i>
                <span>Connect Spotify</span>
              </button>
            </div>
          </div>
          
          {/* Chat Container */}
          <Chat />
        </div>
      </div>
      
      {/* Mobile sidebar toggle button (outside the sidebar) */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-30 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md text-gray-500 dark:text-gray-400"
        >
          <i className="bx bx-menu text-xl"></i>
        </button>
      )}
    </div>
  );
}
