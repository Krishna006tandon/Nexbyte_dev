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

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            const response = await fetch(`/api/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            const updatedTask = await response.json();
            setTask(updatedTask);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAssignUser = async (e) => {
        const userId = e.target.value;
        try {
            const response = await fetch(`/api/tasks/${task._id}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) throw new Error('Failed to assign user');
            const populatedTask = await fetch(`/api/tasks/${task._id}`).then(res => res.json());
            setTask(populatedTask);
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!task) return <p>No task found.</p>;

    console.log('Current User Object:', user);

    return (
        <div className="task-detail-page-container">
            <button onClick={() => navigate(-1)} className="back-button">&larr; Back</button>
            <h1>{task.task_title}</h1>
            <p>{task.task_description}</p>
            
            <div className="task-meta">
                <span><strong>Reward:</strong> ₹{task.reward_amount_in_INR}</span>
                <span><strong>Effort:</strong> {task.estimated_effort_hours} hours</span>
            </div>

            {user && user.role === 'admin' && (
                <>
                    <div className="task-actions">
                        <div className="form-group">
                            <label>Status</label>
                            <select value={task.status} onChange={handleStatusChange}>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Needs Review">Needs Review</option>
                                <option value="Defect">Defect</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Assign To</label>
                            <select value={task.assignedTo?._id || ''} onChange={handleAssignUser}>
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>{user.email}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="task-main-actions">
                        {['In Progress', 'Needs Review'].includes(task.status) && (
                            <button onClick={handleMarkAsDone} className="complete-btn">
                                Mark as Complete
                            </button>
                        )}
                        {task.status === 'Done' && (
                            <button onClick={handleMarkAsDefect} className="defect-btn">
                                Mark as Defect
                            </button>
                        )}
                        {task.status === 'Defect' && (
                            <button onClick={handleMarkForReview} className="review-btn">
                                Mark for Review
                            </button>
                        )}
                        {task.status === 'Done' && <p className="task-completed-message">Task Completed & Credits Awarded</p>}
                    </div>
                </>
            )}

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
                    {task.comments && task.comments.length > 0 ? task.comments.map(comment => (
                        <div key={comment._id} className="comment">
                            <p className="comment-body">{comment.body}</p>
                            <p className="comment-meta">by {comment.user?.email || 'Unknown'} on {new Date(comment.date).toLocaleDateString()}</p>
                        </div>
                    )) : <p>No comments yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;
