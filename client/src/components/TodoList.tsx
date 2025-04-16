import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PlusIcon, CheckCircleIcon, TrashIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Finish chem worksheet', completed: false },
    { id: 2, text: 'Pre-calc chap 3 review', completed: false },
    { id: 3, text: 'finish eng homework', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([
        ...todos, 
        { 
          id: Math.max(0, ...todos.map(t => t.id)) + 1, 
          text: newTodo.trim(), 
          completed: false 
        }
      ]);
      setNewTodo('');
      setIsAdding(false);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="bg-indigo-950/90 text-white rounded-xl shadow-lg p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">My Tasks</h3>
          <Badge variant="outline" className="text-xs py-0 h-5">
            {completedCount}/{totalCount}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 rounded-full text-white hover:bg-indigo-800/50"
          onClick={() => setIsAdding(true)}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div 
            key={todo.id} 
            className="flex items-start space-x-2 py-1 group hover:bg-indigo-900/30 rounded px-1"
          >
            <Checkbox 
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
              className={`mt-0.5 ${todo.completed ? 'bg-green-500 border-green-500' : 'border-indigo-400'}`}
            />
            <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-indigo-300' : ''}`}>
              {todo.text}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-transparent"
              onClick={() => deleteTodo(todo.id)}
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {isAdding && (
          <div className="pt-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add new task..."
              className="w-full bg-indigo-900/50 border border-indigo-700 rounded p-2 text-sm text-white placeholder-indigo-300"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTodo();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTodo('');
                }
              }}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={() => {
                  setIsAdding(false);
                  setNewTodo('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700"
                onClick={addTodo}
              >
                Add task
              </Button>
            </div>
          </div>
        )}

        {!isAdding && todos.length === 0 && (
          <div className="text-center py-3 text-indigo-300 text-sm">
            No tasks yet. Add a task to get started!
          </div>
        )}

        {!isAdding && (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-indigo-300 hover:text-white text-sm mt-1 hover:bg-indigo-800/50"
            onClick={() => setIsAdding(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Add new task
          </Button>
        )}
      </div>
    </div>
  );
}