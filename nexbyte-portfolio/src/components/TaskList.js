import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskList.css';

const TaskList = ({ clientId, refreshTrigger }) => {
    const navigate = useNavigate();
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

    const handleTaskClick = (taskId) => {
        navigate(`/admin/task/${taskId}`);
    };

    const ongoingTasks = tasks.filter(task => !['Done', 'Defect'].includes(task.status));
    const defectTasks = tasks.filter(task => task.status === 'Defect');
    const completedTasks = tasks.filter(task => task.status === 'Done');

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
            <h3>Project Tasks</h3>
            
            <div className="task-section">
                <h4>Ongoing Tasks</h4>
                {ongoingTasks.length === 0 ? (
                    <p>No ongoing tasks.</p>
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
                            {ongoingTasks.map(task => (
                                <tr key={task._id} onClick={() => handleTaskClick(task._id)} className="clickable-row">
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

            <div className="task-section defect-tasks">
                <h4>Defect Tasks</h4>
                {defectTasks.length === 0 ? (
                    <p>No defect tasks.</p>
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
                            {defectTasks.map(task => (
                                <tr key={task._id} onClick={() => handleTaskClick(task._id)} className="clickable-row">
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

            <div className="task-section completed-tasks">
                <h4>Completed Tasks</h4>
                {completedTasks.length === 0 ? (
                    <p>No completed tasks.</p>
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
                            {completedTasks.map(task => (
                                <tr key={task._id} onClick={() => handleTaskClick(task._id)} className="clickable-row">
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
        </div>
    );
};

export default TaskList;
