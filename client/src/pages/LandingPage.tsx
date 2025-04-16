import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/Particles';
import { RoomCreateForm } from '@/components/RoomCreateForm';
import { RoomJoinForm } from '@/components/RoomJoinForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LandingPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function LandingPage({ isDarkMode, toggleDarkMode }: LandingPageProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gradient-bg">
      <Particles isDarkMode={isDarkMode} />
      
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">StudyHub</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">A virtual co-working and study space platform</p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
            <Button onClick={() => setCreateModalOpen(true)}>
              Create a Room
            </Button>
            <Button 
              onClick={() => setJoinModalOpen(true)} 
              variant="secondary"
            >
              Join a Room
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-3">
                <i className="bx bx-group text-2xl text-primary"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Group Study</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-3">
                <i className="bx bx-timer text-2xl text-primary"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pomodoro Timer</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-3">
                <i className="bx bx-chat text-2xl text-primary"></i>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time Chat</p>
            </div>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-500 dark:text-gray-400">
          No account needed - just enter a nickname and start studying!
        </div>
      </div>
      
      {/* Dark mode toggle */}
      <button 
        onClick={toggleDarkMode}
        className="fixed top-5 right-5 p-2 rounded-full bg-white dark:bg-gray-800 shadow text-gray-700 dark:text-gray-300"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <i className={`bx ${isDarkMode ? 'bx-moon' : 'bx-sun'} text-xl`}></i>
      </button>
      
      {/* Create Room Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Create a Study Room
            </DialogTitle>
          </DialogHeader>
          <RoomCreateForm onCancel={() => setCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Join Room Modal */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Join a Study Room
            </DialogTitle>
          </DialogHeader>
          <RoomJoinForm onCancel={() => setJoinModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
