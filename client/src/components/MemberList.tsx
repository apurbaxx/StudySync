import React from 'react';
import { useRoom } from '@/context/RoomContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getStatusColor } from '@/lib/utils';

export function MemberList() {
  const { members } = useRoom();
  
  // Skip current user since they're displayed separately
  const otherMembers = members.filter(m => !m.isHost);
  
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center py-4 px-2">
        <p className="text-xs text-center text-indigo-300">No other members yet</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center space-y-6">
      {otherMembers.map((member) => (
        <div key={member.id} className="relative" title={member.username}>
          <Avatar className="h-16 w-16 border-2 border-indigo-900">
            <AvatarFallback className="bg-indigo-800 text-white">
              {getInitials(member.username)}
            </AvatarFallback>
          </Avatar>
          <div 
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-indigo-950 ${
              member.status === 'focused' ? 'bg-green-500' : 
              member.status === 'break' ? 'bg-yellow-500' : 
              'bg-gray-500'
            }`}
          ></div>
        </div>
      ))}
    </div>
  );
}
