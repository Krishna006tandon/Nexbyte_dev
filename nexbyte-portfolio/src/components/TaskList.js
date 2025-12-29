import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskList.css';

const TaskList = ({ clientId, refreshTrigger }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [interns, setInterns] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

    useEffect(() => {
        const fetchTasksAndInterns = async () => {
            if (!clientId) {
                setTasks([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const headers = { 'x-auth-token': token };

                // Fetch tasks
                const tasksResponse = await fetch(`/api/tasks?clientId=${clientId}`, { headers });
                if (!tasksResponse.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                const tasksData = await tasksResponse.json();

                // Fetch interns
                const usersResponse = await fetch('/api/users', { headers });
                if (!usersResponse.ok) {
                    throw new Error('Failed to fetch users');
                }
                const usersData = await usersResponse.json();
                const internUsers = usersData.filter(user => user.role === 'intern');
                setInterns(internUsers);

                setTasks(tasksData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksAndInterns();
    }, [clientId, refreshTrigger]);

    const handleTaskClick = (taskId) => {
        navigate(`/admin/task/${taskId}`);
    };

    const handleQuickAssign = async (taskId, userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/tasks/${taskId}/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to assign task');
            }
            const updatedTask = await response.json();
            setTasks(tasks.map(task => {
                if (task._id === taskId) {
                    const assignedIntern = interns.find(intern => intern._id === updatedTask.assignedTo);
                    return { ...task, assignedTo: assignedIntern ? assignedIntern.email : null, assignedToId: updatedTask.assignedTo };
                }
                return task;
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            const updatedTask = await response.json();
            setTasks(tasks.map(task => 
                task._id === taskId ? updatedTask : task
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const getPriorityColor = (priority) => {
        if (!priority) return '#6c757d';
        switch (priority.toLowerCase()) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'To Do': return '#6c757d';
            case 'In Progress': return '#007bff';
            case 'Needs Review': return '#fd7e14';
            case 'Done': return '#28a745';
            case 'Defect': return '#dc3545';
            default: return '#6c757d';
        }
    };

    // Filter and sort tasks
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            task.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.task_description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return (a.task_title || '').localeCompare(b.task_title || '');
            case 'status':
                return (a.status || '').localeCompare(b.status || '');
            case 'priority':
                const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
                return (priorityOrder[a.priority?.toLowerCase()] || 3) - (priorityOrder[b.priority?.toLowerCase()] || 3);
            case 'created':
            default:
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });

    const ongoingTasks = sortedTasks.filter(task => !['Done', 'Defect'].includes(task.status));
    const defectTasks = sortedTasks.filter(task => task.status === 'Defect');
    const completedTasks = sortedTasks.filter(task => task.status === 'Done');

    const renderTaskCard = (task) => (
        <div key={task._id} className="task-card" onClick={() => handleTaskClick(task._id)}>
            <div className="task-card-header">
                <h4 className="task-title">{task.task_title}</h4>
                <div className="task-badges">
                    {task.priority && (
                        <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                            {task.priority}
                        </span>
                    )}
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                        {task.status}
                    </span>
                </div>
            </div>
            <p className="task-description">{task.task_description}</p>
            <div className="task-meta">
                <span className="effort">⏱️ {task.estimated_effort_hours || 0}h</span>
                <span className="reward">💰 ₹{task.reward_amount_in_INR || 0}</span>
            </div>
            <div className="task-assign-section" onClick={(e) => e.stopPropagation()}>
                <select
                    value={task.assignedToId || ''}
                    onChange={(e) => handleQuickAssign(task._id, e.target.value)}
                    className="quick-assign-select"
                >
                    <option value="">Quick Assign</option>
                    {interns.map(intern => (
                        <option key={intern._id} value={intern._id}>
                            {intern.email}
                        </option>
                    ))}
                </select>
                <select
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                    className="quick-status-select"
                    style={{ color: getStatusColor(task.status) }}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Done">Done</option>
                    <option value="Defect">Defect</option>
                </select>
            </div>
        </div>
    );

    const renderTaskTable = (taskList) => (
        <table className="tasks-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Effort (hrs)</th>
                    <th>Reward (INR)</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {taskList.map(task => (
                    <tr key={task._id} className="clickable-row">
                        <td onClick={() => handleTaskClick(task._id)}>
                            <div className="task-title-cell">
                                {task.task_title}
                                {task.priority && (
                                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                                        {task.priority}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td onClick={() => handleTaskClick(task._id)}>{task.task_description}</td>
                        <td onClick={() => handleTaskClick(task._id)}>
                            <span className="priority-indicator" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                                {task.priority || 'N/A'}
                            </span>
                        </td>
                        <td onClick={() => handleTaskClick(task._id)}>{task.estimated_effort_hours || 0}</td>
                        <td onClick={() => handleTaskClick(task._id)}>₹{task.reward_amount_in_INR || 0}</td>
                        <td onClick={() => handleTaskClick(task._id)}>
                            <span className="status-indicator" style={{ backgroundColor: getStatusColor(task.status) }}>
                                {task.status}
                            </span>
                        </td>
                        <td>
                            <select
                                value={task.assignedToId || ''}
                                onChange={(e) => handleQuickAssign(task._id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="assign-select"
                            >
                                <option value="">Unassigned</option>
                                {interns.map(intern => (
                                    <option key={intern._id} value={intern._id}>
                                        {intern.email}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task._id);
                                }}
                                className="view-details-btn"
                            >
                                View Details
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (!clientId) {
        return <div className="task-list-container"><h4>Please select a client to view their tasks.</h4></div>;
    }

    if (loading) {
        return <div className="task-list-container"><h4>Loading tasks...</h4></div>;
    }

    if (error) {
        return <div className="task-list-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="task-list-container">
            <div className="task-list-header">
                <h3>Project Tasks</h3>
                <div className="task-controls">
                    <div className="search-filter-group">
                        <input
                            type="text"
                            placeholder="🔍 Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="task-search"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="status-filter"
                        >
                            <option value="all">All Status</option>
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Needs Review">Needs Review</option>
                            <option value="Done">Done</option>
                            <option value="Defect">Defect</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="created">Sort by Created</option>
                            <option value="title">Sort by Title</option>
                            <option value="status">Sort by Status</option>
                            <option value="priority">Sort by Priority</option>
                        </select>
                    </div>
                    <div className="view-toggle">
                        <button
                            className={viewMode === 'cards' ? 'active' : ''}
                            onClick={() => setViewMode('cards')}
                        >
                            📋 Cards
                        </button>
                        <button
                            className={viewMode === 'table' ? 'active' : ''}
                            onClick={() => setViewMode('table')}
                        >
                            📊 Table
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="task-stats">
                <div className="stat-card">
                    <span className="stat-number">{ongoingTasks.length}</span>
                    <span className="stat-label">Ongoing</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{defectTasks.length}</span>
                    <span className="stat-label">Defects</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{completedTasks.length}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{tasks.length}</span>
                    <span className="stat-label">Total</span>
                </div>
            </div>

            <div className="task-section">
                <h4>🚀 Ongoing Tasks ({ongoingTasks.length})</h4>
                {ongoingTasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No ongoing tasks.</p>
                    </div>
                ) : (
                    viewMode === 'cards' ? (
                        <div className="task-cards-grid">
                            {ongoingTasks.map(renderTaskCard)}
                        </div>
                    ) : (
                        renderTaskTable(ongoingTasks)
                    )
                )}
            </div>

            <div className="task-section defect-tasks">
                <h4>🐛 Defect Tasks ({defectTasks.length})</h4>
                {defectTasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No defect tasks.</p>
                    </div>
                ) : (
                    viewMode === 'cards' ? (
                        <div className="task-cards-grid">
                            {defectTasks.map(renderTaskCard)}
                        </div>
                    ) : (
                        renderTaskTable(defectTasks)
                    )
                )}
            </div>

            <div className="task-section completed-tasks">
                <h4>✅ Completed Tasks ({completedTasks.length})</h4>
                {completedTasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No completed tasks.</p>
                    </div>
                ) : (
                    viewMode === 'cards' ? (
                        <div className="task-cards-grid">
                            {completedTasks.map(renderTaskCard)}
                        </div>
                    ) : (
                        renderTaskTable(completedTasks)
                    )
                )}
            </div>
        </div>
    );
};

export default TaskList;
