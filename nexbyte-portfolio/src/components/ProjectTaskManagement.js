import React, { useState, useEffect, useCallback } from 'react';
import TaskProgressDashboard from './TaskProgressDashboard';
import './ProjectTaskManagement.css';

const ProjectTaskManagement = ({ projectId, projectName, onBack }) => {
  console.log('ProjectTaskManagement called with:', { projectId, projectName }); // Debug log
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [bulkAssignIntern, setBulkAssignIntern] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    status: 'pending'
  });

  const [viewMode, setViewMode] = useState('list'); // 'list', 'timeline', or 'dashboard'

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching tasks for projectId:', projectId); // Debug log
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        headers: { 'x-auth-token': token }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      console.log('Fetched tasks:', data); // Debug log
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchInterns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/interns', {
        headers: { 'x-auth-token': token }
      });
      if (!response.ok) throw new Error('Failed to fetch interns');
      const data = await response.json();
      setInterns(data);
    } catch (err) {
      console.error('Error fetching interns:', err);
    }
  };

  // Fetch tasks and interns
  useEffect(() => {
    const fetchData = async () => {
      await fetchTasks();
      await fetchInterns();
    };
    fetchData();
  }, [projectId, fetchTasks]);

  // Task operations
  const handleTaskCreate = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Creating task with data:', { ...newTask, projectId }); // Debug log
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({
          ...newTask,
          estimated_effort_hours: 8, // Default 8 hours
          reward_amount_in_INR: 500 // Default 500 INR
        })
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      const createdTask = await response.json();
      console.log('Task created successfully:', createdTask); // Debug log
      setTasks([...tasks, createdTask]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: '',
        status: 'pending'
      });
    } catch (err) {
      console.error('Error creating task:', err); // Debug log
      setError(err.message);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(task => task._id !== taskId));
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInlineTaskAssignment = async (taskId, userId) => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ userId: userId })
      });
      
      if (!response.ok) throw new Error('Failed to assign task');
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTaskStatusUpdate = async (taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) throw new Error('Failed to update task status');
      const updatedTask = await response.json();
      setTasks(tasks.map(task => task._id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err.message);
    }
  };

  // Bulk operations
  const handleBulkAssign = async () => {
    if (!bulkAssignIntern || selectedTasks.size === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks/bulk-assign', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({
          taskIds: Array.from(selectedTasks),
          assignedTo: bulkAssignIntern
        })
      });
      
      if (!response.ok) throw new Error('Failed to bulk assign tasks');
      const updatedTasks = await response.json();
      setTasks(tasks.map(task => 
        selectedTasks.has(task._id) ? updatedTasks.find(t => t._id === task._id) : task
      ));
      setSelectedTasks(new Set());
      setShowBulkAssignModal(false);
      setBulkAssignIntern('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedTasks.size === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks/bulk-status', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({
          taskIds: Array.from(selectedTasks),
          status
        })
      });
      
      if (!response.ok) throw new Error('Failed to bulk update status');
      const updatedTasks = await response.json();
      setTasks(tasks.map(task => 
        selectedTasks.has(task._id) ? updatedTasks.find(t => t._id === task._id) : task
      ));
      setSelectedTasks(new Set());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTasks.size} task(s)?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks/bulk-delete', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({
          taskIds: Array.from(selectedTasks)
        })
      });
      
      if (!response.ok) throw new Error('Failed to bulk delete tasks');
      setTasks(tasks.filter(task => !selectedTasks.has(task._id)));
      setSelectedTasks(new Set());
    } catch (err) {
      setError(err.message);
    }
  };

  // Export functionality
  const exportTasks = () => {
    const csvContent = [
      ['Title', 'Description', 'Priority', 'Status', 'Assigned To', 'Due Date', 'Created At'],
      ...filteredTasks.map(task => [
        task.task_title || task.title,
        task.task_description || task.description,
        task.priority,
        task.status,
        task.assignedTo?.name || 'Unassigned',
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
        new Date(task.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-tasks.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filtering and searching
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = (task.task_title || task.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.task_description || task.description).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  console.log('Total tasks:', tasks.length, 'Filtered tasks:', filteredTasks.length); // Debug log

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const selectAllTasks = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task._id)));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757'; // Red
      case 'medium': return '#fd7e14'; // Yellow  
      case 'low': return '#28a745'; // Green
      default: return '#6c757d'; // Gray
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'pending': return '#6c757d';
      default: return '#888';
    }
  };

  const getTimelineView = () => {
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      const dateA = new Date(a.dueDate || a.createdAt);
      const dateB = new Date(b.dueDate || b.createdAt);
      return dateA - dateB;
    });

    const today = new Date();
    const tasksByDate = {};

    // Group tasks by date
    sortedTasks.forEach(task => {
      const taskDate = new Date(task.dueDate || task.createdAt);
      const dateKey = taskDate.toISOString().split('T')[0];
      
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    return (
      <div className="timeline-view">
        <div className="timeline-header">
          <h3>Project Timeline</h3>
          <div className="view-toggle">
            <button 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
            >
              List View
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={viewMode === 'timeline' ? 'active' : ''}
            >
              Timeline View
            </button>
          </div>
        </div>
        
        <div className="timeline-content">
          {Object.entries(tasksByDate).map(([date, dateTasks]) => {
            const taskDate = new Date(date);
            const isPast = taskDate < today;
            const isToday = taskDate.toDateString() === today.toDateString();
            
            return (
              <div key={date} className={`timeline-day ${isPast ? 'past' : ''} ${isToday ? 'today' : ''}`}>
                <div className="date-header">
                  <div className="date">
                    {taskDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="task-count">
                    {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="day-tasks">
                  {dateTasks.map(task => (
                    <div key={task._id} className={`timeline-task ${task.status}`}>
                      <div className="task-header">
                        <span className="task-title">{task.title}</span>
                        <span className={`task-priority ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="task-meta">
                        <span className="task-status">{task.status}</span>
                        {task.assignedTo && (
                          <span className="task-assignee">
                            {task.assignedTo.name}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <div className="task-description">
                          {task.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="project-task-management">
      <div className="header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2>{projectName} - Task Management</h2>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button 
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
            >
              📋 List
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={viewMode === 'timeline' ? 'active' : ''}
            >
              📅 Timeline
            </button>
            <button 
              onClick={() => setViewMode('dashboard')}
              className={viewMode === 'dashboard' ? 'active' : ''}
            >
              📊 Dashboard
            </button>
          </div>
        </div>
        <div className="header-right">
          <button className="export-btn" onClick={exportTasks}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Task Content - List, Timeline or Dashboard View */}
      {viewMode === 'dashboard' ? (
        <TaskProgressDashboard 
          tasks={tasks} 
          interns={interns} 
          projectName={projectName}
        />
      ) : viewMode === 'timeline' ? getTimelineView() : (
        <>
          {/* Task Creation Form */}
          <div className="task-creation">
            <h3>Create New Task</h3>
            <div className="task-form">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          />
          <textarea
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
          />
          <select
            value={newTask.assignedTo}
            onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
          >
            <option value="">Select Intern</option>
            {interns.map(intern => (
              <option key={intern._id} value={intern._id}>{intern.name}</option>
            ))}
          </select>
          <button onClick={handleTaskCreate}>Create Task</button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters">
        <div className="filter-left">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="filter-right">
          {selectedTasks.size > 0 && (
            <>
              <button onClick={() => setShowBulkAssignModal(true)}>
                Assign Selected ({selectedTasks.size})
              </button>
              <select onChange={(e) => handleBulkStatusUpdate(e.target.value)}>
                <option value="">Update Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={handleBulkDelete} className="delete-btn">
                Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        <div className="task-list-header">
          <input
            type="checkbox"
            checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
            onChange={selectAllTasks}
          />
          <span>Task</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Assigned To</span>
          <span>Due Date</span>
          <span>Actions</span>
        </div>
        {console.log('About to render tasks:', filteredTasks)} {/* Debug log */}
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found. Create your first task above!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="task-item">
              <input
                type="checkbox"
                checked={selectedTasks.has(task._id)}
                onChange={() => toggleTaskSelection(task._id)}
              />
              <div className="task-info">
                <h4>{task.task_title || task.title}</h4>
                <p>{task.task_description || task.description}</p>
              </div>
              <span
                className="priority"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>
              <select
                value={task.status}
                onChange={(e) => handleTaskStatusUpdate(task._id, e.target.value)}
                className="status-select"
                style={{ color: getStatusColor(task.status) }}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <span className="assigned-to">
                <select
                  value={task.assignedTo?._id || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      // Direct assignment without modal
                      handleInlineTaskAssignment(task._id, e.target.value);
                    }
                  }}
                  className="assignment-dropdown"
                >
                  <option value="">-- Assign to --</option>
                  {interns.map(intern => (
                    <option key={intern._id} value={intern._id}>
                      {intern.name} ({intern.role})
                    </option>
                  ))}
                </select>
              </span>
              <span className="due-date">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </span>
              <div className="task-actions">
                <button onClick={() => handleTaskDelete(task._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Modal - REMOVED */}

      {/* Bulk Assignment Modal */}
      {showBulkAssignModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assign {selectedTasks.size} Task(s)</h3>
            <select
              value={bulkAssignIntern}
              onChange={(e) => setBulkAssignIntern(e.target.value)}
            >
              <option value="">Select Intern</option>
              {interns.map(intern => (
                <option key={intern._id} value={intern._id}>{intern.name}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleBulkAssign}>Assign All</button>
              <button onClick={() => {
                setShowBulkAssignModal(false);
                setBulkAssignIntern('');
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default ProjectTaskManagement;
