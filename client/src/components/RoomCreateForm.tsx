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
  roomName: z.string().min(3, {
    message: 'Room name must be at least 3 characters',
  }).max(30, {
    message: 'Room name must be at most 30 characters',
  }),
  roomTopic: z.string().max(50, {
    message: 'Topic must be at most 50 characters',
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RoomCreateFormProps {
  onCancel: () => void;
}

export function RoomCreateForm({ onCancel }: RoomCreateFormProps) {
  const { createRoom, isLoadingRoom } = useRoom();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      roomName: '',
      roomTopic: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted with data:', data);
    createRoom(data.nickname, data.roomName, data.roomTopic);
    console.log('createRoom function called');
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
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Room Name
        </label>
        <input
          id="roomName"
          type="text"
          placeholder="Enter room name"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          {...register('roomName')}
        />
        {errors.roomName && (
          <p className="mt-1 text-sm text-red-500">{errors.roomName.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="roomTopic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Study Topic (optional)
        </label>
        <input
          id="roomTopic"
          type="text"
          placeholder="What are you studying?"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          {...register('roomTopic')}
        />
        {errors.roomTopic && (
          <p className="mt-1 text-sm text-red-500">{errors.roomTopic.message}</p>
        )}
      </div>
      
      <div className="pt-2 flex gap-3">
        <Button type="submit" className="flex-1" disabled={isLoadingRoom}>
          {isLoadingRoom ? 'Creating...' : 'Create Room'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
