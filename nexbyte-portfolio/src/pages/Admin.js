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
  const [selectedInternForReport, setSelectedInternForReport] = useState(null);
  const [expandedBill, setExpandedBill] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSrsModalOpen, setIsSrsModalOpen] = useState(false);
  const [selectedSrsClient, setSelectedSrsClient] = useState(null);
  const [showInternReport, setShowInternReport] = useState(false);
  const [internReport, setInternReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showProjectTaskManagement, setShowProjectTaskManagement] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const [projectData, setProjectData] = useState({
    projectName: '',
    projectType: '',
    projectDescription: '',
    totalBudget: '',
    projectDeadline: '',
    clientType: 'non-client',
    associatedClient: '',
  });

  const [billData, setBillData] = useState({
    client: '',
    amount: '',
    dueDate: '',
    description: '',
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
      } finally {
        setLoading(false);
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

  const handleAddClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(clientData),
      });
      const data = await res.json();
      if (res.ok) {
        setClients([...clients, data]);
        setClientData({
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
        const fetchRes = await fetch('/api/clients', {
          headers: { 'x-auth-token': token },
        });
        const updatedClients = await fetchRes.json();
        if (fetchRes.ok) {
          setClients(updatedClients);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClients(clients.filter((client) => client._id !== id));
      }
      else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowPassword = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/clients/${id}/password`, {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setClientPasswords({ ...clientPasswords, [id]: data.password });
      }
      else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClientChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleProjectChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects([...projects, data]);
        setProjectData({
          projectName: '',
          projectType: '',
          projectDescription: '',
          totalBudget: '',
          projectDeadline: '',
          clientType: 'non-client',
          associatedClient: '',
        });
        const fetchRes = await fetch('/api/projects', {
          headers: { 'x-auth-token': token },
        });
        const updatedProjects = await fetchRes.json();
        if (fetchRes.ok) {
          setProjects(updatedProjects);
          setSuccessMessage('Project added successfully!');
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
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

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    const dateParts = dateString.split('T')[0].split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return date.toLocaleDateString();
  };

  const handleShowTracker = async (client) => {
    setSelectedClientForTracker(client);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/clients/${client._id}/milestone`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (res.ok) {
        const clientWithMilestone = await res.json();
        setMilestone(clientWithMilestone.milestone);
        setIsTrackerModalOpen(true);
      } else {
        console.error("Failed to fetch milestone");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowInternReport = async (internId) => {
    setSelectedInternForReport(internId);
    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/intern-report/${internId}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (res.ok) {
        const reportData = await res.json();
        setInternReport(reportData);
        setShowInternReport(true);
      } else {
        console.error("Failed to fetch intern report");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const closeInternReport = () => {
    setShowInternReport(false);
    setSelectedInternForReport(null);
    setInternReport(null);
  };

  const handleBillChange = (e) => {
    setBillData({ ...billData, [e.target.name]: e.target.value });
  };

  const handleGenerateBillDescription = async () => {
    if (!billData.client || !billData.amount) {
      alert('Please select a client and enter an amount first.');
      return;
    }

    const selectedClient = clients.find(c => c._id === billData.client);
    if (!selectedClient) {
      alert('Selected client not found.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Find the last bill for the client
      const clientBills = bills.filter(b => b.client._id === billData.client);
      const lastBill = clientBills.length > 0
        ? clientBills.reduce((latest, current) => new Date(latest.billDate) > new Date(current.billDate) ? latest : current)
        : null;
      const lastBillDate = lastBill ? new Date(lastBill.billDate) : null;

      // Fetch tasks for the client
      const tasksRes = await fetch(`/api/tasks?clientId=${billData.client}`, {
        headers: { 'x-auth-token': token },
      });
      if (!tasksRes.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasks = await tasksRes.json();

      // Filter completed tasks since the last bill
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'Done' || !task.completedAt) {
          return false;
        }
        if (lastBillDate) {
          return new Date(task.completedAt) > lastBillDate;
        }
        return true; // Include all completed tasks if no previous bill
      });

      const completedTaskTitles = completedTasks.map(task => task.task_title);

      const res = await fetch('/api/generate-bill-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          clientName: selectedClient.clientName,
          projectName: selectedClient.projectName,
          amount: billData.amount,
          tasks: completedTaskTitles,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate description');
      }

      const { description } = await res.json();
      setBillData({ ...billData, description });
    } catch (err) {
      console.error(err);
      alert(`Failed to generate description. ${err.message}`);
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(billData),
      });
      const data = await res.json();
      if (res.ok) {
        setBills([...bills, data]);
        setBillData({
          client: '',
          amount: '',
          dueDate: '',
        });
        const fetchRes = await fetch('/api/bills', {
          headers: { 'x-auth-token': token },
        });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) {
          setBills(updatedBills);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsPaid = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ status: 'Paid' }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        const fetchRes = await fetch('/api/bills', {
          headers: { 'x-auth-token': token },
        });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) {
          setBills(updatedBills);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentNotDone = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ status: 'Unpaid', paidAmount: 0 }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        const fetchRes = await fetch('/api/bills', {
          headers: { 'x-auth-token': token },
        });
        const updatedBills = await fetchRes.json();
        if (fetchRes.ok) {
          setBills(updatedBills);
        }
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBill = (bill) => {
    if (!bill.client) {
      alert('Client data is not available for this bill.');
      return;
    }
    const clientData = clients.find(c => c._id === bill.client._id);

    if (!clientData) {
      alert('Full client data not found for this bill.');
      return;
    }

    const invoiceContent = `
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #0d1117;
            color: #c9d1d9;
            margin: 0;
            padding: 20px;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 50px;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 50px;
        }
        .header .logo {
            max-width: 150px;
        }
        .company-details h1 {
            margin: 0;
            color: #58a6ff;
            font-size: 2.2em;
            font-weight: 600;
        }
        .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 50px;
        }
        .client-details, .invoice-details {
            width: 48%;
        }
        .client-details strong, .invoice-details strong {
            color: #58a6ff;
            display: block;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
        }
        .items-table thead th {
            background-color: #21262d;
            color: #f0f6fc;
            padding: 15px;
            text-align: left;
            font-weight: 500;
            text-transform: uppercase;
            font-size: 0.85em;
            border-bottom: 1px solid #30363d;
        }
        .items-table tbody tr {
            border-bottom: 1px solid #30363d;
        }
        .items-table tbody tr:last-child {
            border-bottom: none;
        }
        .items-table td {
            padding: 20px 15px;
        }
        .items-table .description {
            font-weight: 500;
        }
        .items-table .qty, .items-table .rate, .items-table .amount {
            text-align: right;
        }
        .total-section {
            margin-top: 30px;
            text-align: right;
        }
        .total-section .grand-total {
            font-size: 1.6em;
            font-weight: 600;
            color: #58a6ff;
            margin-bottom: 10px;
        }
    </style>
    <div class="invoice-box">
        <header class="header">
            <div class="logo">
                <img src="/logobill.jpg" alt="NexByte_Dev Logo" style="max-width: 180px;">
            </div>
            <div class="company-details">
                <h1>INVOICE</h1>
            </div>
        </header>
        <section class="details">
            <div class="client-details">
                <strong>BILL TO:</strong>
                <div>${clientData.contactPerson}</div>
                <div>${clientData.clientName}</div>
                <div>${clientData.billingAddress || 'N/A'}</div>
                <div>${clientData.email}</div>
            </div>
            <div class="invoice-details">
                <div><strong>Invoice #:</strong> ${bill._id}</div>
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</div>
            </div>
        </section>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="qty">Qty</th>
                    <th class="rate">Rate</th>
                    <th class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="description">
                        <strong>${bill.description}</strong>
                    </td>
                    <td class="qty">1</td>
                    <td class="rate">₹${bill.amount.toFixed(2)}</td>
                    <td class="amount">₹${bill.amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        <section class="total-section">
            <div class="grand-total">
                <strong>TOTAL DUE:</strong> ₹${bill.amount.toFixed(2)}
            </div>
        </section>
        <footer class="footer">
            <div>Thank you for choosing NexByte_Dev!</div>
        </footer>
    </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin:       0,
      filename:     `invoice_${bill._id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#0d1117' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save();
  };

  
  const handleDownloadSrs = (client) => {
    if (!client || !client.srsDocument) {
      alert('SRS data is not yet loaded. Please wait a moment and try again.');
      return;
    }
    setIsDownloading(true);
    const srsContent = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background-color: #f9f9f9;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          .srs-box {
            max-width: 800px;
            margin: auto;
            padding: 50px;
            background-color: #fff;
            border: 1px solid #eee;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          .header {
            text-align: center;
            margin-bottom: 50px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          .header img {
            max-width: 150px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #333;
            font-size: 2.2em;
            font-weight: 600;
          }
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #eee;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="srs-box">
            <header class="header">
                <img src="/logobill.jpg" alt="NexByte_Dev Logo">
                <h1>Software Requirement Specification</h1>
            </header>
            <pre>${client.srsDocument}</pre>
            <footer class="footer">
                <p>&copy; ${new Date().getFullYear()} NexByte_Dev. All rights reserved.</p>
            </footer>
        </div>
      </body>
    </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = srsContent;

    const opt = {
      margin:       0,
      filename:     `srs_${client.projectName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save().then(() => {
        setIsDownloading(false);
    });
  }

  const handleSeeSrs = (client) => {
    if (!client || !client.srsDocument) {
        alert('SRS data is not yet loaded. Please wait a moment and try again.');
        return;
    }
    setSelectedSrsClient(client);
    setIsSrsModalOpen(true);
  }

  const closeSrsModal = () => {
    setIsSrsModalOpen(false);
    setSelectedSrsClient(null);
  }

  const handleSrsChange = (e) => {
    setLocalSrsData({ ...localSrsData, [e.target.name]: e.target.value });
  };

  const handleGenerateSrs = (e) => {
    e.preventDefault();
    const selectedClient = clients.find(client => client._id === selectedClientId);
    const fullSrsData = {
      ...localSrsData,
      client: selectedClient,
    };
    setSrsFullData(fullSrsData);
    navigate('/srs-generator');
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(client => client._id === clientId);
    if (selectedClient) {
      setLocalSrsData({
        projectName: selectedClient.projectName || '',
        projectDescription: selectedClient.projectRequirements || '',
        targetAudience: '',
        functionalRequirements: '',
        nonFunctionalRequirements: '',
      });
    }
  };

  
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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

          {location.pathname === '/admin/billing' && (
            <div>
              <h2>Billing Management</h2>
              <div className="form-container">
                <form onSubmit={handleAddBill}>
                  <h3>Create New Bill</h3>
                  <select name="client" value={billData.client} onChange={handleBillChange} required>
                    <option value="">Select a Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                    ))}
                  </select>
                  <input type="number" name="amount" placeholder="Amount" value={billData.amount} onChange={handleBillChange} required />
                  <input type="date" name="dueDate" placeholder="Due Date" value={billData.dueDate} onChange={handleBillChange} required />
                  <textarea name="description" placeholder="Description" value={billData.description} onChange={handleBillChange}></textarea>
                  <div className="button-group">
                    <button type="button" onClick={handleGenerateBillDescription} className="btn btn-secondary">Generate Description</button>
                    <button type="submit" className="btn btn-primary">Create Bill</button>
                  </div>
                </form>
              </div>

              <h3>All Bills</h3>
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill._id}>
                      <td>{bill.client?.clientName || 'N/A'}</td>
                      <td>₹{bill.amount}</td>
                      <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${bill.status.toLowerCase()}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td>
                        {expandedBill === bill._id ? (
                          <div>
                            {bill.description}
                            <button onClick={() => setExpandedBill(null)} className="btn btn-secondary">Show Less</button>
                          </div>
                        ) : (
                          <button onClick={() => setExpandedBill(bill._id)} className="btn btn-secondary">Show More</button>
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleDownloadBill(bill)} className="btn btn-info">Download</button>
                        {bill.status === 'Unpaid' ? (
                          <button onClick={() => handleMarkAsPaid(bill._id)} className="btn btn-success">Mark as Paid</button>
                        ) : (
                          <button onClick={() => handlePaymentNotDone(bill._id)} className="btn btn-warning">Payment Not Done</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/srs-generator' && (
            <div>
              <h2>SRS Generator</h2>
              <div className="form-container">
                <form onSubmit={handleGenerateSrs}>
                  <h3>Generate SRS Document</h3>
                  <select value={selectedClientId} onChange={(e) => handleClientSelect(e.target.value)} required>
                    <option value="">Select a Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                    ))}
                  </select>
                  <input type="text" name="projectName" placeholder="Project Name" value={localSrsData.projectName} onChange={handleSrsChange} required />
                  <textarea name="projectDescription" placeholder="Project Description" value={localSrsData.projectDescription} onChange={handleSrsChange} required></textarea>
                  <textarea name="targetAudience" placeholder="Target Audience" value={localSrsData.targetAudience} onChange={handleSrsChange}></textarea>
                  <textarea name="functionalRequirements" placeholder="Functional Requirements" value={localSrsData.functionalRequirements} onChange={handleSrsChange}></textarea>
                  <textarea name="nonFunctionalRequirements" placeholder="Non-Functional Requirements" value={localSrsData.nonFunctionalRequirements} onChange={handleSrsChange}></textarea>
                  <button type="submit" className="btn btn-primary">Generate SRS</button>
                </form>
              </div>

              <h3>Client SRS Documents</h3>
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project</th>
                    <th>SRS Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>{client.clientName}</td>
                      <td>{client.projectName}</td>
                      <td>
                        {client.srsDocument ? (
                          <span className="status completed">Generated</span>
                        ) : (
                          <span className="status pending">Not Generated</span>
                        )}
                      </td>
                      <td>
                        {client.srsDocument ? (
                          <>
                            <button onClick={() => handleSeeSrs(client)} className="btn btn-info">View SRS</button>
                            <button onClick={() => handleDownloadSrs(client)} className="btn btn-primary" disabled={isDownloading}>
                              {isDownloading ? 'Downloading...' : 'Download SRS'}
                            </button>
                          </>
                        ) : (
                          <span className="text-muted">No SRS Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {location.pathname === '/admin/reports' && (
            <div>
              <h2>Intern Reports</h2>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Performance</th>
                    <th>Tasks Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.filter(member => member.role === 'intern').map((intern) => (
                    <tr key={intern._id}>
                      <td>{intern.email}</td>
                      <td>{intern.email}</td>
                      <td>{intern.role}</td>
                      <td>
                        <div className="performance-metrics">
                          <div className="metric">
                            <span>Task Completion:</span>
                            <div className="progress-bar">
                              <div className="progress" style={{width: '75%'}}></div>
                            </div>
                            <span>75%</span>
                          </div>
                          <div className="metric">
                            <span>Priority Tasks:</span>
                            <div className="progress-bar">
                              <div className="progress" style={{width: '60%'}}></div>
                            </div>
                            <span>60%</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="task-stats">
                          <div>Total: 24</div>
                          <div>Completed: 18</div>
                          <div>Pending: 6</div>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleShowInternReport(intern._id)} className="btn btn-info">
                          {reportLoading && selectedInternForReport === intern._id ? 'Loading...' : 'View Report'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {isSrsModalOpen && selectedSrsClient && (
          <Modal isOpen={isSrsModalOpen} onClose={closeSrsModal}>
            <div className="srs-modal">
              <h2>SRS Document for {selectedSrsClient.projectName}</h2>
              <div className="srs-content">
                <pre>{selectedSrsClient.srsDocument}</pre>
              </div>
              <div className="modal-actions">
                <button onClick={() => handleDownloadSrs(selectedSrsClient)} className="btn btn-primary">
                  {isDownloading ? 'Downloading...' : 'Download PDF'}
                </button>
                <button onClick={closeSrsModal} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </Modal>
        )}

        {showInternReport && internReport && (
          <Modal isOpen={showInternReport} onClose={closeInternReport}>
            <div className="intern-report-modal">
              <h2>Intern Report</h2>
              <div className="report-content">
                <h3>Performance Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4>Total Tasks</h4>
                    <p>{internReport.totalTasks || 24}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Completed Tasks</h4>
                    <p>{internReport.completedTasks || 18}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Completion Rate</h4>
                    <p>{internReport.completionRate || '75%'}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Priority Tasks</h4>
                    <p>{internReport.priorityTasks || 12}</p>
                  </div>
                </div>
                
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {internReport.recentActivity ? internReport.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <span className="activity-date">{new Date(activity.date).toLocaleDateString()}</span>
                      <span className="activity-description">{activity.description}</span>
                    </div>
                  )) : (
                    <p>No recent activity available</p>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={closeInternReport} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Admin;
