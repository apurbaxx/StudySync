import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MemberList } from '@/components/MemberList';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TimerControl } from '@/components/TimerControl';
import { Chat } from '@/components/Chat';
import { TodoList } from '@/components/TodoList';
import { StatusSelector } from '@/components/StatusSelector';
import { useRoom } from '@/context/RoomContext';
import { useUser } from '@/context/UserContext';
import { getInitials } from '@/lib/utils';
import { Link2Icon, CopyIcon, VolumeIcon, MicIcon, VideoIcon } from 'lucide-react';

// Import the background image
import cherryBlossomBg from '@/assets/cherry-blossom-background.jpg';

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

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`Join my study room: ${room?.id}`);
    // Could add a toast notification here
  };
  
  return (
    <div 
      className="h-screen w-screen overflow-hidden relative flex"
      style={{
        backgroundImage: `url(${cherryBlossomBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay to make content more readable */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Top Navigation Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black/60 text-white rounded-full px-5 py-2 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium">Study & Chill with Us</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-white/10 text-white"
            onClick={copyRoomLink}
            title="Copy room link"
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Left Sidebar - Members */}
      <div 
        className={`h-screen w-24 bg-indigo-950/80 backdrop-blur-sm text-white z-20 flex flex-col items-center pt-24 pb-4 ${
          sidebarOpen ? '' : 'hidden md:flex'
        }`}
      >
        <div className="flex-1 overflow-y-auto no-scrollbar w-full">
          {/* Member Avatars */}
          <div className="flex flex-col items-center space-y-6 px-2">
            {user && (
              <div className="relative" title={`${user.username} (You)`}>
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarFallback className="bg-indigo-700 text-white">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-indigo-950"></div>
              </div>
            )}
            
            {/* Other Members */}
            {room && room.id && (
              <div className="w-full">
                <MemberList />
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Controls */}
        <div className="pt-4 flex flex-col items-center space-y-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            title="Audio controls"
          >
            <MicIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            title="Video controls"
          >
            <VideoIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            title="Audio settings"
          >
            <VolumeIcon className="h-5 w-5" />
          </Button>
          <Button 
            onClick={handleLeaveRoom}
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-red-500/80 hover:bg-red-600 text-white mt-4"
            title="Leave room"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Right Sidebar - Timer & Tools */}
      <div className="absolute right-4 top-4 bottom-4 w-72 flex flex-col space-y-4 z-20">
        {/* Timer Card */}
        <div className="bg-indigo-950/90 text-white rounded-xl shadow-lg p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Group Timer</h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          <div className="flex justify-center items-center">
            <PomodoroTimer />
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-indigo-900/50 rounded-full h-1.5 mb-1">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-indigo-300">
              <span>16:43 remaining</span>
              <span>25:00</span>
            </div>
          </div>
          
          <div className="mt-4">
            <TimerControl />
          </div>
        </div>
        
        {/* Todo List */}
        <TodoList />
        
        {/* Chat - Using the existing Chat component but styled for our new design */}
        <div className="flex-1 bg-indigo-950/90 text-white rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-indigo-800">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Chat</h3>
              <span className="text-xs text-indigo-300">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          
          {/* We'll update the styling of the Chat component with a wrapper */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Chat />
          </div>
        </div>
      </div>
      
      {/* Bottom Music Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black/60 text-white rounded-full px-4 py-2 flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-700 text-xs">
              LF
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">Lofi beats to study and relax...</div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile toggle button */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-30 bg-indigo-950/80 rounded-full p-2 shadow-md text-white"
        >
          <i className="bx bx-menu text-xl"></i>
        </button>
      )}
    </div>
  );
}
