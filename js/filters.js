/**
 * Filter Engine with Today & Upcoming Logic
 */

const currentFilters = {
  searchQuery: '',
  status: 'all',      // 'all', 'today', 'upcoming', 'active', 'completed'
  priority: 'all',    // 'all', 'high', 'medium', 'low'
  category: 'all',    // 'all', 'personal', 'study', 'work', 'other'
  sortBy: 'newest'    // 'newest', 'oldest', 'dueDate', 'priority', 'alphabetical'
};

export function getFilterState() {
  return currentFilters;
}

export function setFilter(key, value) {
  if (key in currentFilters) {
    currentFilters[key] = value;
  }
}

export function applyFiltersAndSort(tasks) {
  const todayStr = new Date().toISOString().split('T')[0];

  return tasks
    .filter(task => {
      // 1. Search Filter
      if (currentFilters.searchQuery.trim()) {
        const query = currentFilters.searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description ? task.description.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchDesc) return false;
      }

      // 2. Status / Temporal Filters
      if (currentFilters.status === 'active' && task.completed) return false;
      if (currentFilters.status === 'completed' && !task.completed) return false;
      
      if (currentFilters.status === 'today') {
        if (task.dueDate !== todayStr) return false;
      }

      if (currentFilters.status === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      }

      // 3. Priority Filter
      if (currentFilters.priority !== 'all' && task.priority !== currentFilters.priority) return false;

      // 4. Category Filter
      if (currentFilters.category !== 'all' && task.category !== currentFilters.category) return false;

      return true;
    })
    .sort((a, b) => {
      // Special default sorting for "Upcoming" view
      if (currentFilters.status === 'upcoming' && currentFilters.sortBy === 'newest') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }

      switch (currentFilters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);

        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);

        case 'priority': {
          const priorityMap = { high: 3, medium: 2, low: 1 };
          return priorityMap[b.priority] - priorityMap[a.priority];
        }

        case 'alphabetical':
          return a.title.localeCompare(b.title);

        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
}