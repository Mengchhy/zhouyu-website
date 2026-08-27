/**
 * LocalStorage Service Module
 */
const TASKS_KEY = 'taskflow_tasks_v1';

export function saveTasksToStorage(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

export function loadTasksFromStorage() {
  try {
    const rawData = localStorage.getItem(TASKS_KEY);
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.error('Failed to parse tasks from localStorage:', error);
    return null;
  }
}