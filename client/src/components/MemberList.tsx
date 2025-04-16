import React from 'react';
import { useRoom } from '@/context/RoomContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getStatusColor } from '@/lib/utils';

export function MemberList() {
  const { members } = useRoom();
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Members ({members.length})
      </h3>
      
      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No members yet</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(member.username)}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`}></div>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {member.username} {member.isHost && <span className="text-xs text-gray-500">(Host)</span>}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {member.status === 'focused' ? 'Focused' : 
                   member.status === 'break' ? 'On break' : 'Away'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
