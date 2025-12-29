import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      console.log('DEBUG: Updating task:', taskId, 'to status:', newStatus);
      
      // Direct task update with task ID
      let response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
        toast.success('Task status updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('All update attempts failed:', response.status, errorData);
        
        // If all API endpoints fail, update locally and show appropriate message
        if (response.status === 403 || response.status === 404) {
          console.log('DEBUG: All endpoints failed, updating locally...');
          setTasks(tasks.map(task => 
            task._id === taskId ? { ...task, status: newStatus } : task
          ));
          toast.success('Task status updated locally (changes may not be saved to server)');
        } else {
          toast.error(`Failed to update task: ${errorData.msg || 'Permission denied'}`);
        }
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleQuickAssign = async (taskId, userId) => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign task');
      }
      
      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, assignedTo: interns.find(i => i._id === userId) } : task
      ));
      console.log('Task assigned successfully:', updatedTask);
    } catch (err) {
      setError(err.message);
    }
  };

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
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#888';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'approved': return '#17a2b8';
      case 'in-progress': return '#007bff';
      case 'review': return '#fd7e14';
      case 'testing': return '#6610f2';
      case 'pending': return '#6c757d';
      case 'on-hold': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#888';
    }
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
          <button className="export-btn" onClick={exportTasks}>
            Export CSV
          </button>
        </div>
      </div>

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
            <option value="review">Under Review</option>
            <option value="testing">Testing</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
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
                <option value="review">Under Review</option>
                <option value="testing">Testing</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
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
                <option value="review">Under Review</option>
                <option value="testing">Testing</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="assigned-to">
                {/* DEBUG: Inline Assign Dropdown */}
                <select
                  value={task.assignedTo?._id || ''}
                  onChange={(e) => {
                    console.log('Assigning task', task._id, 'to intern', e.target.value);
                    handleQuickAssign(task._id, e.target.value);
                  }}
                  className="assign-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Unassigned</option>
                  {interns.map(intern => (
                    <option key={intern._id} value={intern._id}>
                      {intern.name || intern.email}
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
    </div>
  );
};

export default ProjectTaskManagement;
