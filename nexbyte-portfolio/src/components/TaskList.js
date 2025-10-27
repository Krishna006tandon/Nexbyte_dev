import React, { useState, useEffect } from 'react';
import './TaskList.css';

const TaskList = ({ clientId, refreshTrigger }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!clientId) {
                setTasks([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/tasks?clientId=${clientId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [clientId, refreshTrigger]);

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
            <h3>Saved Tasks for Project</h3>
            {tasks.length === 0 ? (
                <p>No tasks found for this project.</p>
            ) : (
                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Effort (hrs)</th>
                            <th>Reward (INR)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task._id}>
                                <td>{task.task_title}</td>
                                <td>{task.task_description}</td>
                                <td>{task.estimated_effort_hours}</td>
                                <td>₹{task.reward_amount_in_INR}</td>
                                <td>{task.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TaskList;
