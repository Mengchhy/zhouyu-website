/**
 * State Management & Task Analytics
 */
import { saveTasksToStorage, loadTasksFromStorage } from './storage.js';

let tasks = [];

const defaultTasks = [
  {
    id: '1',
    title: 'Explore Stage 5 Statistics',
    description: 'Check out the live metrics and progress bar at the top of the dashboard.',
    completed: false,
    priority: 'high',
    category: 'study',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];

export function initTasks() {
  const stored = loadTasksFromStorage();
  if (stored !== null) {
    tasks = stored;
  } else {
    tasks = defaultTasks;
    saveTasksToStorage(tasks);
  }
}

export function getTasks() {
  return tasks;
}

export function getTaskById(id) {
  return tasks.find(t => t.id === id);
}

export function addTask(taskData) {
  const newTask = {
    id: Date.now().toString(),
    title: taskData.title.trim(),
    description: taskData.description.trim(),
    dueDate: taskData.dueDate || '',
    priority: taskData.priority || 'medium',
    category: taskData.category || 'personal',
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  return newTask;
}

export function updateTask(id, updatedData) {
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      title: updatedData.title.trim(),
      description: updatedData.description.trim(),
      dueDate: updatedData.dueDate || '',
      priority: updatedData.priority || 'medium',
      category: updatedData.category || 'personal'
    };
    saveTasksToStorage(tasks);
  }
}

export function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasksToStorage(tasks);
  }
}

export function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasksToStorage(tasks);
}

export function getRemainingCount() {
  return tasks.filter(t => !t.completed).length;
}

/**
 * Statistics Analytics Calculator
 */
export function getTaskStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, active, highPriority, percentage };
}

/**
 * Determines if a task date is past today
 */
export function isTaskOverdue(dueDateStr, isCompleted) {
  if (!dueDateStr || isCompleted) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dueDateStr.split('-');
  const dueDate = new Date(year, month - 1, day);

  return dueDate < today;
}