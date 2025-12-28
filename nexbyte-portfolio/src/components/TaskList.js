import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskList.css';

const TaskList = ({ clientId, projectId, refreshTrigger, projectName }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [interns, setInterns] = useState([]);

    useEffect(() => {
        const fetchTasksAndInterns = async () => {
            if (!clientId && !projectId) {
                setTasks([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const headers = { 'x-auth-token': token };

                // Fetch tasks
                let tasksUrl = '/api/tasks?';
                if (projectId) {
                    tasksUrl += `projectId=${projectId}`;
                } else if (clientId) {
                    tasksUrl += `clientId=${clientId}`;
                }
                
                const tasksResponse = await fetch(tasksUrl, { headers });
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
    }, [clientId, projectId, refreshTrigger]);

    const handleTaskClick = (taskId) => {
        navigate(`/admin/task/${taskId}`);
    };

    const handleAssignTask = async (taskId, userId) => {
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

    const renderTaskTable = (taskList) => (
        <table className="tasks-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Effort (hrs)</th>
                    <th>Reward (INR)</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                </tr>
            </thead>
            <tbody>
                {taskList.map(task => (
                    <tr key={task._id} className="clickable-row">
                        <td onClick={() => handleTaskClick(task._id)}>{task.task_title}</td>
                        <td onClick={() => handleTaskClick(task._id)}>{task.task_description}</td>
                        <td onClick={() => handleTaskClick(task._id)}>{task.estimated_effort_hours}</td>
                        <td onClick={() => handleTaskClick(task._id)}>₹{task.reward_amount_in_INR}</td>
                        <td onClick={() => handleTaskClick(task._id)}>{task.status}</td>
                        <td>
                            <select
                                value={task.assignedToId || ''}
                                onChange={(e) => handleAssignTask(task._id, e.target.value)}
                                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking select
                            >
                                <option value="">Unassigned</option>
                                {interns.map(intern => (
                                    <option key={intern._id} value={intern._id}>
                                        {intern.email}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const ongoingTasks = tasks.filter(task => !['Done', 'Defect'].includes(task.status));
    const defectTasks = tasks.filter(task => task.status === 'Defect');
    const completedTasks = tasks.filter(task => task.status === 'Done');

    if (!clientId && !projectId) {
        return <div className="task-list-container"><h4>Please select a client or project to view tasks.</h4></div>;
    }

    if (loading) {
        return <div className="task-list-container"><h4>Loading tasks...</h4></div>;
    }

    if (error) {
        return <div className="task-list-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="task-list-container">
            <h3>{projectName ? `${projectName} Tasks` : 'Project Tasks'}</h3>
            
            <div className="task-section">
                <h4>Ongoing Tasks</h4>
                {ongoingTasks.length === 0 ? (
                    <p>No ongoing tasks.</p>
                ) : (
                    renderTaskTable(ongoingTasks)
                )}
            </div>

            <div className="task-section defect-tasks">
                <h4>Defect Tasks</h4>
                {defectTasks.length === 0 ? (
                    <p>No defect tasks.</p>
                ) : (
                    renderTaskTable(defectTasks)
                )}
            </div>

            <div className="task-section completed-tasks">
                <h4>Completed Tasks</h4>
                {completedTasks.length === 0 ? (
                    <p>No completed tasks.</p>
                ) : (
                    renderTaskTable(completedTasks)
                )}
            </div>
        </div>
    );
};

export default TaskList;
