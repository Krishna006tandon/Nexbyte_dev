import React, { useState, useEffect } from 'react';
import './TaskGenerator.css';

const TaskGenerator = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectGoal, setProjectGoal] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [fixedCosts, setFixedCosts] = useState('');
    const [generatedTasks, setGeneratedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch clients to populate the dropdown
        const fetchClients = async () => {
            try {
                const response = await fetch('/api/clients');
                if (!response.ok) {
                    throw new Error('Failed to fetch clients');
                }
                const data = await response.json();
                setClients(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchClients();
    }, []);

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        setSelectedClient(clientId);

        const client = clients.find(c => c._id === clientId);
        if (client) {
            setProjectName(client.projectName || '');
            setTotalBudget(client.totalBudget || '');
            setProjectGoal(client.projectRequirements || '');
        }
    };

    const handleGenerateDescription = async () => {
        if (!projectName && !projectGoal) {
            alert('Please select a client or provide project name and requirements first.');
            return;
        }
        setIsGeneratingDesc(true);
        setError(null);
        try {
            const response = await fetch('/api/generate-project-description', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectName: projectName,
                    projectRequirements: projectGoal, // Using the goal/requirements field as input
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to generate description');
            }

            const { description } = await response.json();
            setProjectGoal(description);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGeneratingDesc(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGeneratedTasks([]);

        try {
            const response = await fetch('/api/generate-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientId: selectedClient,
                    projectName,
                    projectGoal,
                    total_budget_in_INR: parseInt(totalBudget),
                    fixed_costs_in_INR: parseInt(fixedCosts),
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to generate tasks');
            }

            const tasks = await response.json();
            setGeneratedTasks(tasks);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="task-generator-container">
            <h2>AI Project Task Generator</h2>
            <form onSubmit={handleSubmit} className="task-generator-form">
                <div className="form-group">
                    <label htmlFor="client">Select Client</label>
                    <select id="client" value={selectedClient} onChange={handleClientChange} required>
                        <option value="" disabled>-- Select a Client --</option>
                        {clients.map(client => (
                            <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="projectName">Project Name</label>
                    <input type="text" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <div className="label-with-button">
                        <label htmlFor="projectGoal">Project Description & Requirements</label>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc}>
                            {isGeneratingDesc ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea id="projectGoal" value={projectGoal} onChange={(e) => setProjectGoal(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="totalBudget">Total Budget (INR)</label>
                    <input type="number" id="totalBudget" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="fixedCosts">Fixed Costs (INR)</label>
                    <input type="number" id="fixedCosts" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} required />
                </div>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Generating Tasks...' : 'Generate Tasks'}</button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {generatedTasks.length > 0 && (
                <div className="generated-tasks-container">
                    <h3>Generated Tasks</h3>
                    <ul className="tasks-list">
                        {generatedTasks.map((task, index) => (
                            <li key={index} className="task-item">
                                <h4>{task.task_title}</h4>
                                <p>{task.task_description}</p>
                                <p><strong>Effort:</strong> {task.estimated_effort_hours} hours</p>
                                <p><strong>Reward:</strong> ₹{task.reward_amount_in_INR}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TaskGenerator;
