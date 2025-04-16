import React, { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LandingPage } from "@/pages/LandingPage";
import { StudyRoom } from "@/pages/StudyRoom";
import { UserProvider } from "@/context/UserContext";
import { RoomProvider } from "@/context/RoomContext";
import NotFound from "@/pages/not-found";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Try to get the stored preference from localStorage
    const savedMode = localStorage.getItem('darkMode');
    
    // If no stored preference, use system preference
    if (savedMode === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return savedMode === 'true';
  });
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const [inRoom, setInRoom] = useState(false);
  
  const enterRoom = () => setInRoom(true);
  const leaveRoom = () => setInRoom(false);
  
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RoomProvider onRoomTransition={enterRoom}>
          {inRoom ? (
            <StudyRoom onLeaveRoom={leaveRoom} />
          ) : (
            <LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
          )}
          <Toaster />
        </RoomProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
