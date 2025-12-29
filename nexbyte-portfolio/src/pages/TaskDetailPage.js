import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './TaskDetailPage.css';

const TaskDetailPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [task, setTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({});
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const taskRes = await fetch(`/api/tasks/${taskId}`);
                if (!taskRes.ok) throw new Error('Failed to fetch task details');
                const taskData = await taskRes.json();
                setTask(taskData);

                const usersRes = await fetch('/api/users');
                if (!usersRes.ok) throw new Error('Failed to fetch users');
                const usersData = await usersRes.json();
                setUsers(usersData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [taskId]);

    const handleStatusChange = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedTask = await response.json();
            setTask(updatedTask);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAssignUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tasks/${task._id}/assign`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error('Failed to assign user');
            const populatedTask = await fetch(`/api/tasks/${task._id}`).then(res => res.json());
            setTask(populatedTask);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTaskEdit = () => {
        setIsEditing(true);
        setEditedTask({
            task_title: task.task_title,
            task_description: task.task_description,
            estimated_effort_hours: task.estimated_effort_hours,
            reward_amount_in_INR: task.reward_amount_in_INR,
            priority: task.priority || 'medium'
        });
    };

    const handleTaskUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify(editedTask),
            });
            if (!response.ok) throw new Error('Failed to update task');
            const updatedTask = await response.json();
            setTask(updatedTask);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleTaskDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tasks/${task._id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Failed to delete task');
            navigate('/admin/tasks');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const response = await fetch(`/api/tasks/${task._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: newComment }),
            });
            if (!response.ok) throw new Error('Failed to add comment');
            const updatedTask = await response.json();
            setTask(updatedTask);
            setNewComment('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMarkAsDone = async () => {
        try {
            const response = await fetch(`/api/tasks/${task._id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Done' }),
                });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedTask = await response.json();
            setTask(updatedTask);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMarkAsDefect = async () => {
        try {
            const response = await fetch(`/api/tasks/${task._id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Defect' }),
                });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedTask = await response.json();
            setTask(updatedTask);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMarkForReview = async () => {
        try {
            const response = await fetch(`/api/tasks/${task._id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Needs Review' }),
                });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedTask = await response.json();
            setTask(updatedTask);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) return (
        <div className="task-detail-loading">
            <div className="spinner"></div>
            <p>Loading task details...</p>
        </div>
    );
    
    if (error) return (
        <div className="task-detail-error">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    );
    
    if (!task) return (
        <div className="task-detail-error">
            <p>No task found.</p>
            <button onClick={() => navigate('/admin/tasks')}>Back to Tasks</button>
        </div>
    );

    console.log('Current User Object:', user);

    return (
        <div className="task-detail-page-container">
            <div className="task-detail-header">
                <button onClick={() => navigate(-1)} className="back-button">← Back</button>
                <div className="task-actions-header">
                    {user && user.role === 'admin' && (
                        <>
                            <button onClick={handleTaskEdit} className="edit-btn">
                                ✏️ Edit Task
                            </button>
                            <button onClick={handleTaskDelete} className="delete-btn">
                                🗑️ Delete Task
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="task-detail-content">
                <div className="task-main-info">
                    <div className="task-title-section">
                        <h1>{task.task_title}</h1>
                        <div className="task-badges">
                            {task.priority && (
                                <span 
                                    className="priority-badge" 
                                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                                >
                                    {task.priority} Priority
                                </span>
                            )}
                            <span 
                                className="status-badge" 
                                style={{ backgroundColor: getStatusColor(task.status) }}
                            >
                                {task.status}
                            </span>
                        </div>
                    </div>
                    
                    <p className="task-description">{task.task_description}</p>
                    
                    <div className="task-meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">💰 Reward</span>
                            <span className="meta-value">₹{task.reward_amount_in_INR || 0}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">⏱️ Effort</span>
                            <span className="meta-value">{task.estimated_effort_hours || 0} hours</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">📅 Created</span>
                            <span className="meta-value">{formatDate(task.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">👤 Assigned To</span>
                            <span className="meta-value">
                                {task.assignedTo?.email || 'Unassigned'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="task-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        📋 Details
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        💬 Comments ({task.comments?.length || 0})
                    </button>
                    {user && user.role === 'admin' && (
                        <button 
                            className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('actions')}
                        >
                            ⚡ Actions
                        </button>
                    )}
                </div>

                <div className="tab-content">
                    {activeTab === 'details' && (
                        <div className="details-tab">
                            {isEditing ? (
                                <div className="edit-form">
                                    <h3>Edit Task</h3>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={editedTask.task_title}
                                            onChange={(e) => setEditedTask({...editedTask, task_title: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={editedTask.task_description}
                                            onChange={(e) => setEditedTask({...editedTask, task_description: e.target.value})}
                                            rows={4}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Effort (hours)</label>
                                            <input
                                                type="number"
                                                value={editedTask.estimated_effort_hours}
                                                onChange={(e) => setEditedTask({...editedTask, estimated_effort_hours: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Reward (INR)</label>
                                            <input
                                                type="number"
                                                value={editedTask.reward_amount_in_INR}
                                                onChange={(e) => setEditedTask({...editedTask, reward_amount_in_INR: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Priority</label>
                                        <select
                                            value={editedTask.priority}
                                            onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button onClick={handleTaskUpdate} className="save-btn">
                                            💾 Save Changes
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="cancel-btn">
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="task-details">
                                    <h3>Task Information</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Status:</label>
                                            <span 
                                                className="status-indicator" 
                                                style={{ backgroundColor: getStatusColor(task.status) }}
                                            >
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Priority:</label>
                                            <span 
                                                className="priority-indicator" 
                                                style={{ backgroundColor: getPriorityColor(task.priority) }}
                                            >
                                                {task.priority || 'Not set'}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Assigned Intern:</label>
                                            <span>{task.assignedTo?.email || 'Not assigned'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Reward Amount:</label>
                                            <span>₹{task.reward_amount_in_INR || 0}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Estimated Effort:</label>
                                            <span>{task.estimated_effort_hours || 0} hours</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Created Date:</label>
                                            <span>{formatDate(task.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="comments-tab">
                            <h3>Comments</h3>
                            <form onSubmit={handleAddComment} className="comment-form">
                                <textarea 
                                    value={newComment} 
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    required
                                    rows={3}
                                />
                                <button type="submit" className="add-comment-btn">
                                    💬 Add Comment
                                </button>
                            </form>
                            <div className="comments-list">
                                {task.comments && task.comments.length > 0 ? (
                                    task.comments.map(comment => (
                                        <div key={comment._id} className="comment">
                                            <div className="comment-header">
                                                <span className="comment-author">
                                                    {comment.user?.email || 'Unknown'}
                                                </span>
                                                <span className="comment-date">
                                                    {formatDate(comment.date)}
                                                </span>
                                            </div>
                                            <p className="comment-body">{comment.body}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-comments">
                                        <p>No comments yet. Be the first to comment!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && user && user.role === 'admin' && (
                        <div className="actions-tab">
                            <h3>Quick Actions</h3>
                            
                            <div className="action-section">
                                <h4>Change Status</h4>
                                <div className="status-actions">
                                    <select 
                                        value={task.status} 
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Needs Review">Needs Review</option>
                                        <option value="Defect">Defect</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div className="action-section">
                                <h4>Assign Task</h4>
                                <div className="assign-actions">
                                    <select 
                                        value={task.assignedTo?._id || ''} 
                                        onChange={(e) => handleAssignUser(e.target.value)}
                                        className="assign-select"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.filter(u => u.role === 'intern').map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="action-section">
                                <h4>Task Completion</h4>
                                <div className="completion-actions">
                                    {['In Progress', 'Needs Review'].includes(task.status) && (
                                        <button onClick={handleMarkAsDone} className="complete-btn">
                                            ✅ Mark as Complete
                                        </button>
                                    )}
                                    {task.status === 'Done' && (
                                        <button onClick={handleMarkAsDefect} className="defect-btn">
                                            🐛 Mark as Defect
                                        </button>
                                    )}
                                    {task.status === 'Defect' && (
                                        <button onClick={handleMarkForReview} className="review-btn">
                                            👁️ Mark for Review
                                        </button>
                                    )}
                                    {task.status === 'Done' && (
                                        <div className="completion-message">
                                            ✅ Task Completed & Credits Awarded
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;
