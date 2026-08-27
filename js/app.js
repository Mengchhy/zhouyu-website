/**
 * Main Controller - Complete Architecture
 */
import { initTasks, addTask, updateTask, toggleTask, deleteTask } from './tasks.js';
import { setFilter } from './filters.js';
import { initTheme, toggleTheme } from './theme.js';
import { 
  renderTasks, 
  openAddModal, 
  openEditModal, 
  closeTaskModal, 
  openConfirmModal, 
  closeConfirmModal,
  toggleMobileSidebar,
  closeMobileSidebar
} from './ui.js';

let taskToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Modules
  initTheme();
  initTasks();
  renderTasks();

  // 2. Theme Toggle Listener
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

  // 3. Mobile Sidebar Controls
  document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

  // 4. Search Listener
  document.getElementById('search-input').addEventListener('input', (e) => {
    setFilter('searchQuery', e.target.value);
    renderTasks();
  });

  // 5. Filter & Sort Dropdown Listeners
  const filterStatusSelect = document.getElementById('filter-status');
  filterStatusSelect.addEventListener('change', (e) => {
    setFilter('status', e.target.value);
    syncSidebarStatus(e.target.value);
    renderTasks();
  });

  const filterPrioritySelect = document.getElementById('filter-priority');
  filterPrioritySelect.addEventListener('change', (e) => {
    setFilter('priority', e.target.value);
    renderTasks();
  });

  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', (e) => {
    setFilter('sortBy', e.target.value);
    renderTasks();
  });

  // 6. Sidebar Navigation (Status & Category)
  document.getElementById('status-nav-list').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const status = li.dataset.status;
    if (status) {
      setFilter('status', status);
      filterStatusSelect.value = status;
      
      document.querySelectorAll('#status-nav-list li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      renderTasks();
      closeMobileSidebar();
    }
  });

  document.getElementById('category-nav-list').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const category = li.dataset.category;
    if (category) {
      setFilter('category', category);
      document.querySelectorAll('#category-nav-list li').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      renderTasks();
      closeMobileSidebar();
    }
  });

  // 7. Modal Listeners
  document.getElementById('open-add-modal-btn').addEventListener('click', openAddModal);
  document.getElementById('close-modal-btn').addEventListener('click', closeTaskModal);
  document.getElementById('cancel-modal-btn').addEventListener('click', closeTaskModal);

  // 8. Form Submission
  document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const taskId = document.getElementById('task-id-input').value;
    const title = document.getElementById('task-title-input').value;
    const description = document.getElementById('task-desc-input').value;
    const dueDate = document.getElementById('task-date-input').value;
    const priority = document.getElementById('task-priority-input').value;
    const category = document.getElementById('task-category-input').value;

    if (!title.trim()) return;

    const payload = { title, description, dueDate, priority, category };

    if (taskId) {
      updateTask(taskId, payload);
    } else {
      addTask(payload);
    }

    renderTasks();
    closeTaskModal();
  });

  // 9. Task Card Event Delegation
  document.getElementById('task-list').addEventListener('click', (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;

    const taskId = card.dataset.id;

    if (e.target.classList.contains('task-checkbox')) {
      toggleTask(taskId);
      renderTasks();
    } else if (e.target.classList.contains('edit-btn')) {
      openEditModal(taskId);
    } else if (e.target.classList.contains('delete-btn')) {
      taskToDeleteId = taskId;
      openConfirmModal();
    }
  });

  // 10. Delete Dialog Listeners
  document.getElementById('cancel-delete-btn').addEventListener('click', () => {
    taskToDeleteId = null;
    closeConfirmModal();
  });

  document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (taskToDeleteId) {
      deleteTask(taskToDeleteId);
      taskToDeleteId = null;
      renderTasks();
    }
    closeConfirmModal();
  });

  // 11. Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeConfirmModal();
      closeMobileSidebar();
    }
  });

  function syncSidebarStatus(status) {
    document.querySelectorAll('#status-nav-list li').forEach(el => {
      if (el.dataset.status === status) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }
});