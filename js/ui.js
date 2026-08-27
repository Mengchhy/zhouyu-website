/**
 * UI Renderer with Micro-Animations & Mobile Drawer
 */
import { getTasks, getRemainingCount, getTaskById, getTaskStats, isTaskOverdue } from './tasks.js';
import { applyFiltersAndSort, getFilterState } from './filters.js';

const taskListContainer = document.getElementById('task-list');
const remainingCountText = document.getElementById('remaining-count-text');
const viewTitle = document.getElementById('view-title');

const taskModal = document.getElementById('task-modal');
const confirmModal = document.getElementById('confirm-modal');
const taskForm = document.getElementById('task-form');

const modalTitle = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id-input');
const titleInput = document.getElementById('task-title-input');
const descInput = document.getElementById('task-desc-input');
const dateInput = document.getElementById('task-date-input');
const priorityInput = document.getElementById('task-priority-input');
const categoryInput = document.getElementById('task-category-input');
const saveTaskBtn = document.getElementById('save-task-btn');

const sidebar = document.getElementById('app-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

export function renderTasks() {
  const rawTasks = getTasks();
  const visibleTasks = applyFiltersAndSort(rawTasks);
  const filterState = getFilterState();

  renderStatistics();
  updateHeaderViewTitle(filterState.status);

  taskListContainer.innerHTML = '';

  if (visibleTasks.length === 0) {
    renderEmptyState(filterState, rawTasks.length);
  } else {
    visibleTasks.forEach(task => {
      const overdue = isTaskOverdue(task.dueDate, task.completed);
      const card = document.createElement('div');
      card.className = `task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`;
      card.dataset.id = task.id;

      card.innerHTML = `
        <div class="task-left">
          <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            aria-label="Mark task '${escapeHTML(task.title)}' complete"
          />
          <div class="task-content">
            <div class="task-title">${escapeHTML(task.title)}</div>
            ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
            
            <div class="task-meta">
              ${task.dueDate ? `
                <span class="meta-item ${overdue ? 'overdue-text' : ''}">
                  ${overdue ? '⚠️ Overdue:' : '📅'} ${formatDate(task.dueDate)}
                </span>
              ` : ''}
              <span class="priority-badge priority-${task.priority}">${task.priority}</span>
              <span class="category-tag">${task.category}</span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-action edit-btn" aria-label="Edit task">Edit</button>
          <button class="btn btn-danger-text delete-btn" aria-label="Delete task">Delete</button>
        </div>
      `;

      taskListContainer.appendChild(card);
    });
  }

  const remaining = getRemainingCount();
  remainingCountText.textContent = `You have ${remaining} task${remaining === 1 ? '' : 's'} remaining.`;
}

function renderStatistics() {
  const stats = getTaskStats();
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-completed').textContent = stats.completed;
  document.getElementById('stat-active').textContent = stats.active;
  document.getElementById('stat-high').textContent = stats.highPriority;

  const fill = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  const progressTrack = fill.parentElement;

  fill.style.width = `${stats.percentage}%`;
  text.textContent = `${stats.percentage}% completed`;
  progressTrack.setAttribute('aria-valuenow', stats.percentage);
}

function updateHeaderViewTitle(status) {
  const titles = {
    all: 'All Tasks 👋',
    today: "Today's Tasks 📅",
    upcoming: 'Upcoming Tasks 🚀',
    completed: 'Completed Tasks 🎉',
    active: 'Active Tasks ⚡'
  };
  viewTitle.textContent = titles[status] || 'Welcome 👋';
}

function renderEmptyState(filterState, totalCount) {
  if (filterState.searchQuery.trim()) {
    taskListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No tasks found</h3>
        <p>No results matching "${escapeHTML(filterState.searchQuery)}". Try another search.</p>
      </div>
    `;
  } else if (filterState.status === 'today') {
    taskListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎉</div>
        <h3>You're all caught up!</h3>
        <p>No tasks scheduled for today.</p>
      </div>
    `;
  } else if (filterState.status === 'upcoming') {
    taskListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">☕</div>
        <h3>No upcoming tasks</h3>
        <p>You have no future due dates set.</p>
      </div>
    `;
  } else if (totalCount === 0) {
    taskListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>No tasks yet</h3>
        <p>Click <strong>+ Add Task</strong> above to get started!</p>
      </div>
    `;
  } else {
    taskListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <h3>No matching tasks</h3>
        <p>There are no tasks matching your selected filters.</p>
      </div>
    `;
  }
}

export function openAddModal() {
  taskForm.reset();
  taskIdInput.value = '';
  modalTitle.textContent = 'Add New Task';
  saveTaskBtn.textContent = 'Add Task';
  taskModal.classList.remove('hidden');
  taskModal.setAttribute('aria-hidden', 'false');
  titleInput.focus();
}

export function openEditModal(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;

  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descInput.value = task.description || '';
  dateInput.value = task.dueDate || '';
  priorityInput.value = task.priority || 'medium';
  categoryInput.value = task.category || 'personal';

  modalTitle.textContent = 'Edit Task';
  saveTaskBtn.textContent = 'Save Changes';
  taskModal.classList.remove('hidden');
  taskModal.setAttribute('aria-hidden', 'false');
  titleInput.focus();
}

export function closeTaskModal() {
  taskModal.classList.add('hidden');
  taskModal.setAttribute('aria-hidden', 'true');
}

export function openConfirmModal() {
  confirmModal.classList.remove('hidden');
  confirmModal.setAttribute('aria-hidden', 'false');
}

export function closeConfirmModal() {
  confirmModal.classList.add('hidden');
  confirmModal.setAttribute('aria-hidden', 'true');
}

export function toggleMobileSidebar() {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
}

export function closeMobileSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}