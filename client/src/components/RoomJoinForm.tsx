import React from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRoom } from '@/context/RoomContext';

const formSchema = z.object({
  nickname: z.string().min(2, {
    message: 'Nickname must be at least 2 characters',
  }).max(20, {
    message: 'Nickname must be at most 20 characters',
  }),
  roomId: z.string().length(6, {
    message: 'Room code must be 6 characters',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface RoomJoinFormProps {
  onCancel: () => void;
}

export function RoomJoinForm({ onCancel }: RoomJoinFormProps) {
  const { joinRoom, isLoadingRoom } = useRoom();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      roomId: '',
    },
  });

  const onSubmit = (data: FormData) => {
    joinRoom(data.nickname, data.roomId);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Nickname
        </label>
        <input
          id="nickname"
          type="text"
          placeholder="Enter your nickname"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          {...register('nickname')}
        />
        {errors.nickname && (
          <p className="mt-1 text-sm text-red-500">{errors.nickname.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Room Code
        </label>
        <input
          id="roomId"
          type="text"
          placeholder="Enter room code"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          {...register('roomId')}
        />
        {errors.roomId && (
          <p className="mt-1 text-sm text-red-500">{errors.roomId.message}</p>
        )}
      </div>
      
      <div className="pt-2 flex gap-3">
        <Button type="submit" className="flex-1" disabled={isLoadingRoom}>
          {isLoadingRoom ? 'Joining...' : 'Join Room'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
