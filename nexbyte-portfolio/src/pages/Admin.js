import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Admin.css';
import Sidebar from '../components/Sidebar';
import { SrsContext } from '../context/SrsContext';
import TaskGenerator from '../components/TaskGenerator';
import TaskList from '../components/TaskList';
import ProjectTracker from '../components/ProjectTracker';
import ProjectTaskManagement from '../components/ProjectTaskManagement';
import Modal from '../components/Modal';

const Admin = () => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bills, setBills] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [internType, setInternType] = useState('free');
  const [internshipStartDate, setInternshipStartDate] = useState('');
  const [internshipEndDate, setInternshipEndDate] = useState('');
  const [acceptanceDate, setAcceptanceDate] = useState('');
  const [clientPasswords, setClientPasswords] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [taskPageClientId, setTaskPageClientId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedClientForTracker, setSelectedClientForTracker] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [showInternReport, setShowInternReport] = useState(false);
  const [selectedInternForReport, setSelectedInternForReport] = useState(null);
  const [internReport, setInternReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [expandedBill, setExpandedBill] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSrsModalOpen, setIsSrsModalOpen] = useState(false);
  const [selectedSrsClient, setSelectedSrsClient] = useState(null);
  const [showProjectTaskManagement, setShowProjectTaskManagement] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { setSrsFullData } = useContext(SrsContext);

  // Check if we have navigation state from TaskGenerator
  useEffect(() => {
    console.log('Checking navigation state:', location.state); // Debug log
    console.log('Available projects:', projects); // Debug log
    if (location.state?.fromTaskGenerator && location.state?.selectedProjectId) {
      // Find the project and set it for task management
      const project = projects.find(p => p._id === location.state.selectedProjectId);
      console.log('Found project:', project); // Debug log
      if (project) {
        setSelectedProjectForTasks(project);
        setShowProjectTaskManagement(true);
        console.log('Set project for task management'); // Debug log
      }
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, projects, navigate, location.pathname]);

  const [clientData, setClientData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
    companyAddress: '',
    projectName: '',
    projectType: '',
    projectRequirements: '',
    projectDeadline: '',
    totalBudget: '',
    billingAddress: '',
    gstNumber: '',
    paymentTerms: '',
    paymentMethod: '',
    domainRegistrarLogin: '',
    webHostingLogin: '',
    logoAndBrandingFiles: '',
    content: '',
  });

  const [billData, setBillData] = useState({
    client: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const [projectData, setProjectData] = useState({
    projectName: '',
    projectType: '',
    projectDescription: '',
    totalBudget: '',
    projectDeadline: '',
    clientType: 'non-client',
    associatedClient: '',
  });

  const [localSrsData, setLocalSrsData] = useState({
    projectName: '',
    projectDescription: '',
    targetAudience: '',
    functionalRequirements: '',
    nonFunctionalRequirements: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      try {
        if (location.pathname === '/admin/contacts') {
          const res = await fetch('/api/contacts', { headers });
          const data = await res.json();
          if (res.ok) {
            setContacts(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/messages') {
          const res = await fetch('/api/messages', { headers });
          const data = await res.json();
          if (res.ok) {
            setMessages(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/members') {
          const res = await fetch('/api/users', { headers });
          const data = await res.json();
          if (res.ok) {
            setMembers(data);
          } else {
            console.error(data.message);
          }
        } else if (location.pathname === '/admin/reports') {
          const res = await fetch('/api/users', { headers });
          const data = await res.json();
          if (res.ok) {
            setMembers(data);
          } else {
            console.error(data.message);
          }
        } else if (['/admin/clients', '/admin/srs-generator', '/admin/billing', '/admin/tasks', '/admin/projects', '/admin/task-management'].includes(location.pathname)) {
          const res = await fetch('/api/clients', { headers });
          const data = await res.json();
          if (res.ok) {
            setClients(data);
          } else {
            console.error(data.message);
          }
        }

        if (['/admin/projects', '/admin/task-management'].includes(location.pathname)) {
          const res = await fetch('/api/projects', { headers });
          const data = await res.json();
          if (res.ok) {
            setProjects(data);
          } else {
            console.error(data.message);
          }
        }

        if (location.pathname === '/admin/billing') {
          const res = await fetch('/api/bills', { headers });
          const data = await res.json();
          if (res.ok) {
            setBills(data);
          } else {
            console.error(data.message);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [location.pathname]);

  const handleTasksSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ email, password, role, internType: role === 'intern' ? internType : undefined, internshipStartDate: role === 'intern' ? internshipStartDate : undefined, internshipEndDate: role === 'intern' ? internshipEndDate : undefined, acceptanceDate: role === 'intern' ? acceptanceDate : undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers([...members, data]);
        setEmail('');
        setPassword('');
        setInternType('free');
        setInternshipStartDate('');
        setInternshipEndDate('');
        setAcceptanceDate('');
        const fetchRes = await fetch('/api/users', {
          headers: { 'x-auth-token': token },
        });
        const updatedMembers = await fetchRes.json();
        if (fetchRes.ok) {
          setMembers(updatedMembers);
          setSuccessMessage('Member added successfully!');
          setTimeout(() => setSuccessMessage(''), 5000); // Clear message after 5 seconds
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMembers(members.filter((member) => member._id !== id));
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInternSubmit = async (e) => {
    e.preventDefault();
    try {
      // ... rest of the code remains the same ...
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(internForm)
      });

      if (!response.ok) throw new Error('Failed to create intern');

      const newIntern = await response.json();
      setInterns([...interns, newIntern.user]);
      setShowInternModal(false);
      setInternForm({
        name: '',
        email: '',
        password: '',
        role: 'intern',
        internType: 'free'
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteIntern = async (internId) => {
    if (!window.confirm('Are you sure you want to delete this intern?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/interns/${internId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (!response.ok) throw new Error('Failed to delete intern');

      setInterns(interns.filter(i => i._id !== internId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderDashboard = () => (
    <div className="dashboard-grid">
      <div className="stat-card">
        <h3>Total Projects</h3>
        <div className="stat-number">{projects.length}</div>
      </div>
      <div className="stat-card">
        <h3>Total Interns</h3>
        <div className="stat-number">{interns.length}</div>
      </div>
      <div className="stat-card">
        <h3>Total Tasks</h3>
        <div className="stat-number">{tasks.length}</div>
      </div>
      <div className="stat-card">
        <h3>Completed Tasks</h3>
        <div className="stat-number">{tasks.filter(t => t.status === 'completed').length}</div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="projects-section">
      <div className="section-header">
        <h2>Projects</h2>
        <button className="btn-primary" onClick={() => setShowProjectModal(true)}>
          Add New Project
        </button>
      </div>
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <h3>{project.projectName}</h3>
            <p><strong>Type:</strong> {project.projectType}</p>
            <p><strong>Budget:</strong> ₹{project.totalBudget}</p>
            <p><strong>Deadline:</strong> {new Date(project.projectDeadline).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={`status ${project.status}`}>{project.status}</span></p>
            <div className="card-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate(`/admin/projects/${project._id}/tasks`)}
              >
                Manage Tasks
              </button>
              <button className="btn-danger" onClick={() => handleDeleteProject(project._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInterns = () => (
    <div className="interns-section">
      <div className="section-header">
        <h2>Interns</h2>
        <button className="btn-primary" onClick={() => setShowInternModal(true)}>
          Add New Intern
        </button>
      </div>
      <div className="interns-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Intern Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interns.map(intern => (
              <tr key={intern._id}>
                <td>{intern.name}</td>
                <td>{intern.email}</td>
                <td>{intern.role}</td>
                <td>{intern.internType || 'N/A'}</td>
                <td>
                  <button className="btn-danger" onClick={() => handleDeleteIntern(intern._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  console.log('Bills:', bills);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <h1>Admin Dashboard</h1>
          {successMessage && <div className="success-message">{successMessage}</div>}
          {location.pathname === '/admin/contacts' && (
            <div>
              <h2>Contact Messages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.mobile}</td>
                      <td>{contact.message}</td>
                      <td>{new Date(contact.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/messages' && (
            <div>
              <h2>Client Messages</h2>
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Message</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message._id}>
                      <td>{message.client?.clientName || 'N/A'}</td>
                      <td>{message.message}</td>
                      <td>{new Date(message.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/members' && (
            <div>
              <h2>Manage Members</h2>
              <div className="form-container">
                <form onSubmit={handleAddMember}>
                  <h3>Add New Member</h3>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="intern">Intern</option>
                  </select>
                  {role === 'intern' && (
                    <>
                      <label>Intern Type:</label>
                      <select value={internType} onChange={(e) => setInternType(e.target.value)}>
                        <option value="free">Free Intern (no money in no money out)</option>
                        <option value="stipend">Stipend Intern (Intern gets money based on growth)</option>
                      </select>
                      <label>Internship Start Date:</label>
                      <input
                        type="date"
                        placeholder="Internship Start Date"
                        value={internshipStartDate}
                        onChange={(e) => setInternshipStartDate(e.target.value)}
                        required
                      />
                      <label>Internship End Date:</label>
                      <input
                        type="date"
                        placeholder="Internship End Date"
                        value={internshipEndDate}
                        onChange={(e) => setInternshipEndDate(e.target.value)}
                        required
                      />
                      <label>Offer Acceptance Deadline:</label>
                      <input
                        type="date"
                        placeholder="Acceptance Date"
                        value={acceptanceDate}
                        onChange={(e) => setAcceptanceDate(e.target.value)}
                        required
                      />
                    </>
                  )}
                  <button type="submit" className="btn btn-primary">Add Member</button>
                </form>
              </div>

              <h3>All Members</h3>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Intern Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Acceptance Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{member.role === 'intern' ? (member.internType === 'free' ? 'Free' : 'Stipend') : 'N/A'}</td>
                      <td>{member.role === 'intern' ? formatDate(member.internshipStartDate) : 'N/A'}</td>
                      <td>{member.role === 'intern' ? formatDate(member.internshipEndDate) : 'N/A'}</td>
                      <td>{formatDate(member.acceptanceDate)}</td>
                      <td>
                        <button onClick={() => handleDeleteMember(member._id)} className="btn btn-danger">Delete</button>
                        {(member.role === 'intern' || member.role === 'user' || member.role === 'member') && (
                          <button onClick={() => handleShowInternReport(member._id)} className="btn btn-info">
                            {reportLoading && selectedInternForReport === member._id ? 'Loading...' : 'View Report'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/clients' && (
            <div>
              <h2>Manage Clients</h2>
              <div className="form-container">
                <form onSubmit={handleAddClient}>
                  <h3>Add New Client</h3>
                  <input type="text" name="clientName" placeholder="Client/Company Name" value={clientData.clientName} onChange={handleClientChange} required />
                  <input type="text" name="contactPerson" placeholder="Contact Person's Name" value={clientData.contactPerson} onChange={handleClientChange} required />
                  <input type="email" name="email" placeholder="Email Address" value={clientData.email} onChange={handleClientChange} required />
                  <input type="text" name="phone" placeholder="Phone Number" value={clientData.phone} onChange={handleClientChange} />
                  <input type="text" name="companyAddress" placeholder="Company Address" value={clientData.companyAddress} onChange={handleClientChange} />
                  <input type="text" name="projectName" placeholder="Project Name" value={clientData.projectName} onChange={handleClientChange} required />
                  <input type="text" name="projectType" placeholder="Project Type" value={clientData.projectType} onChange={handleClientChange} />
                  <textarea name="projectRequirements" placeholder="Project Requirements" value={clientData.projectRequirements} onChange={handleClientChange}></textarea>
                  <input type="date" name="projectDeadline" placeholder="Project Deadline" value={clientData.projectDeadline} onChange={handleClientChange} />
                  <input type="number" name="totalBudget" placeholder="Total Budget" value={clientData.totalBudget} onChange={handleClientChange} />
                  <input type="text" name="billingAddress" placeholder="Billing Address" value={clientData.billingAddress} onChange={handleClientChange} />
                  <input type="text" name="gstNumber" placeholder="GST Number" value={clientData.gstNumber} onChange={handleClientChange} />
                  <input type="text" name="paymentTerms" placeholder="Payment Terms" value={clientData.paymentTerms} onChange={handleClientChange} />
                  <input type="text" name="paymentMethod" placeholder="Payment Method" value={clientData.paymentMethod} onChange={handleClientChange} />
                  <input type="text" name="domainRegistrarLogin" placeholder="Domain Registrar Login" value={clientData.domainRegistrarLogin} onChange={handleClientChange} />
                  <input type="text" name="webHostingLogin" placeholder="Web Hosting Login" value={clientData.webHostingLogin} onChange={handleClientChange} />
                  <input type="text" name="logoAndBrandingFiles" placeholder="Logo and Branding Files (URL)" value={clientData.logoAndBrandingFiles} onChange={handleClientChange} />
                  <input type="text" name="content" placeholder="Content (URL)" value={clientData.content} onChange={handleClientChange} />
                  <button type="submit" className="btn btn-primary">Add Client</button>
                </form>
              </div>

              <h3>All Clients</h3>
              <table>
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Contact Person</th>
                    <th>Email</th>
                    <th>Project Name</th>
                    <th>Password</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.clientName}</td>
                      <td>{client.contactPerson}</td>
                      <td>{client.email}</td>
                      <td>{client.projectName}</td>
                      <td>
                        {clientPasswords[client._id] ? (
                          clientPasswords[client._id]
                        ) : (
                          <button onClick={() => handleShowPassword(client._id)} className="btn btn-secondary">Show Password</button>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDeleteClient(client._id)} className="btn btn-danger">Delete</button>
                        <button onClick={() => handleShowTracker(client)} className="btn btn-info">Show Tracker</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/projects' && (
            <div>
              <h2>Manage Projects</h2>
              <div className="form-container">
                <form onSubmit={handleAddProject}>
                  <h3>Add New Project</h3>
                  <input type="text" name="projectName" placeholder="Project Name" value={projectData.projectName} onChange={handleProjectChange} required />
                  <input type="text" name="projectType" placeholder="Project Type" value={projectData.projectType} onChange={handleProjectChange} />
                  <textarea name="projectDescription" placeholder="Project Description" value={projectData.projectDescription} onChange={handleProjectChange}></textarea>
                  <input type="number" name="totalBudget" placeholder="Total Budget" value={projectData.totalBudget} onChange={handleProjectChange} />
                  <input type="date" name="projectDeadline" placeholder="Project Deadline" value={projectData.projectDeadline} onChange={handleProjectChange} />
                  <select name="clientType" value={projectData.clientType} onChange={handleProjectChange} required>
                    <option value="non-client">Non-Client Project</option>
                    <option value="client">Client Project</option>
                  </select>
                  {projectData.clientType === 'client' && (
                    <select name="associatedClient" value={projectData.associatedClient} onChange={handleProjectChange} required>
                      <option value="">Select a Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                      ))}
                    </select>
                  )}
                  <button type="submit" className="btn btn-primary">Add Project</button>
                </form>
              </div>

              <h3>All Projects</h3>
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Project Type</th>
                    <th>Description</th>
                    <th>Total Budget</th>
                    <th>Deadline</th>
                    <th>Client Type</th>
                    <th>Associated Client</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project._id}>
                      <td>{project.projectName}</td>
                      <td>{project.projectType}</td>
                      <td>{project.projectDescription}</td>
                      <td>{project.totalBudget}</td>
                      <td>{project.projectDeadline ? new Date(project.projectDeadline).toLocaleDateString() : 'N/A'}</td>
                      <td>{project.clientType}</td>
                      <td>
                        {project.associatedClient ? 
                          (project.associatedClient.clientName || 'Client') : 
                          'N/A'
                        }
                      </td>
                      <td>
                        <button onClick={() => handleDeleteProject(project._id)} className="btn btn-danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/task-management' && (
            <div className="task-management-section">
              {showProjectTaskManagement && selectedProjectForTasks ? (
                <ProjectTaskManagement
                  projectId={selectedProjectForTasks._id}
                  projectName={selectedProjectForTasks.projectName}
                  onBack={() => {
                    setShowProjectTaskManagement(false);
                    setSelectedProjectForTasks(null);
                  }}
                />
              ) : (
                <div>
                  <h2>Project Task Management</h2>
                  <div className="project-selection">
                    <h3>Select a project to manage tasks</h3>
                    <div className="project-grid">
                      {projects.map(project => (
                        <div key={project._id} className="project-card">
                          <h4>{project.projectName}</h4>
                          <p>{project.projectDescription}</p>
                          <button
                            onClick={() => {
                              setSelectedProjectForTasks(project);
                              setShowProjectTaskManagement(true);
                            }}
                            className="btn btn-primary"
                          >
                            Manage Tasks
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {location.pathname === '/admin/tasks' && (
            <div>
              <TaskGenerator 
                clients={clients} 
                clientId={taskPageClientId} 
                onClientChange={setTaskPageClientId}
                onTasksSaved={handleTasksSaved}
              />
              <TaskList clientId={taskPageClientId} refreshTrigger={refreshTrigger} />
            </div>
          )}

          {['/admin', '/admin/'].includes(location.pathname) && (
            <p>Welcome to the admin dashboard!</p>
          )}
        </div>

        {isTrackerModalOpen && selectedClientForTracker && milestone && (
          <Modal isOpen={isTrackerModalOpen} onClose={() => setIsTrackerModalOpen(false)}>
            <div className="project-tracker-modal">
              <h2>Project Tracker for {selectedClientForTracker.projectName}</h2>
              <ProjectTracker currentMilestone={milestone} />
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Admin;