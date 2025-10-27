import React, { useState, useEffect } from 'react';
import './Modal.css'; // Re-using Modal.css for base styling
import './TaskDetailModal.css';

const TaskDetailModal = ({ taskId, isOpen, onClose, onUpdate }) => {
    const [task, setTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchTaskDetails = async () => {
            if (!taskId) return;
            setLoading(true);
            try {
                // Fetch task details
                const taskRes = await fetch(`/api/tasks/${taskId}`);
                if (!taskRes.ok) throw new Error('Failed to fetch task details');
                const taskData = await taskRes.json();
                setTask(taskData);

                // Fetch all users for assignment dropdown
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

        if (isOpen) {
            fetchTaskDetails();
        }
    }, [taskId, isOpen]);

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const response = await fetch(`/api/tasks/${task._id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedTask = await response.json();
            setTask(updatedTask);
            onUpdate(); // Notify parent to refresh list
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAssignUser = async (e) => {
        const userId = e.target.value;
        try {
            const response = await fetch(`/api/tasks/${task._id}/assign`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });
            if (!response.ok) throw new Error('Failed to assign user');
            await response.json();
            // Re-fetch to populate the user
            const populatedTask = await fetch(`/api/tasks/${task._id}`).then(res => res.json());
            setTask(populatedTask);
            onUpdate();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const response = await fetch(`/api/tasks/${task._id}/comments`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ body: newComment }),
                });
            if (!response.ok) throw new Error('Failed to add comment');
            const updatedTask = await response.json();
            setTask(updatedTask);
            setNewComment('');
            onUpdate();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content task-detail-modal">
                <button onClick={onClose} className="close-modal-btn">&times;</button>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {task && (
                    <>
                        <h2>{task.task_title}</h2>
                        <p>{task.task_description}</p>
                        <div className="task-meta">
                            <span><strong>Reward:</strong> ₹{task.reward_amount_in_INR}</span>
                            <span><strong>Effort:</strong> {task.estimated_effort_hours} hours</span>
                        </div>

                        <div className="task-actions">
                            <div className="form-group">
                                <label>Status</label>
                                <select value={task.status} onChange={handleStatusChange}>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Assign To</label>
                                <select value={task.assignedTo?._id || ''} onChange={handleAssignUser}>
                                    <option value="" disabled>Unassigned</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.email}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="comments-section">
                            <h3>Comments</h3>
                            <form onSubmit={handleAddComment} className="comment-form">
                                <textarea 
                                    value={newComment} 
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    required
                                />
                                <button type="submit">Add Comment</button>
                            </form>
                            <div className="comments-list">
                                {task.comments && task.comments.map(comment => (
                                    <div key={comment._id} className="comment">
                                        <p className="comment-body">{comment.body}</p>
                                        <p className="comment-meta">by {comment.user?.email || 'Unknown'} on {new Date(comment.date).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TaskDetailModal;
