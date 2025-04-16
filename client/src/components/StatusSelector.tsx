import React from 'react';
import { useUser } from '@/context/UserContext';
import { useRoom } from '@/context/RoomContext';

export function StatusSelector() {
  const { user } = useUser();
  const { changeStatus } = useRoom();
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    changeStatus(status);
  };
  
  return (
    <select
      id="status-selector"
      className="text-xs bg-transparent text-gray-500 dark:text-gray-400 border-none p-0 cursor-pointer focus:ring-0"
      value={user?.status || 'focused'}
      onChange={handleStatusChange}
    >
      <option value="focused">Focused</option>
      <option value="break">On break</option>
      <option value="away">Away</option>
    </select>
  );
}
