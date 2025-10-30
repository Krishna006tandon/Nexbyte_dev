import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Admin.css';
import Sidebar from '../components/Sidebar';
import { SrsContext } from '../context/SrsContext';
import TaskGenerator from '../components/TaskGenerator';
import TaskList from '../components/TaskList';
import ProjectTracker from '../components/ProjectTracker';
import Modal from '../components/Modal';

const Admin = () => {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [clientPasswords, setClientPasswords] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { setSrsFullData } = useContext(SrsContext);

  // State for Task Manager Page
  const [taskPageClientId, setTaskPageClientId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedClientForTracker, setSelectedClientForTracker] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [expandedBill, setExpandedBill] = useState(null);


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

  const [localSrsData, setLocalSrsData] = useState({
    projectName: '',
    projectDescription: '',
    targetAudience: '',
    functionalRequirements: '',
    nonFunctionalRequirements: '',
  });
  const [selectedClientId, setSelectedClientId] = useState('');

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
        } else if (['/admin/clients', '/admin/srs-generator', '/admin/billing', '/admin/tasks'].includes(location.pathname)) {
          const res = await fetch('/api/clients', { headers });
          const data = await res.json();
          if (res.ok) {
            setClients(data);
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
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers([...members, data]);
        setEmail('');
        setPassword('');
        const fetchRes = await fetch('/api/users', {
          headers: { 'x-auth-token': token },
        });
        const updatedMembers = await fetchRes.json();
        if (fetchRes.ok) {
          setMembers(updatedMembers);
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
      }
      else {
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

  const handleApprovePayment = async (billId, paymentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${billId}/approve-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ paymentId }),
      });
      const updatedBill = await res.json();
      if (res.ok) {
        setBills(bills.map(b => b._id === billId ? updatedBill : b));
      } else {
        throw new Error(updatedBill.message || 'Failed to approve payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectPayment = async (billId, paymentId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/bills/${billId}/reject-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ paymentId }),
      });
      const updatedBill = await res.json();
      if (res.ok) {
        setBills(bills.map(b => b._id === billId ? updatedBill : b));
      } else {
        throw new Error(updatedBill.message || 'Failed to reject payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  

  console.log('Bills:', bills);
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <div className="card">
          <h1>Admin Dashboard</h1>
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
                  </select>
                  <button type="submit" className="btn btn-primary">Add Member</button>
                </form>
              </div>

              <h3>All Members</h3>
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member._id}>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>
                        <button onClick={() => handleDeleteMember(member._id)} className="btn btn-danger">Delete</button>
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

          {location.pathname === '/admin/billing' && (() => {
            const billsByClient = bills.reduce((acc, bill) => {
              const client = bill.client;
              if (!client) return acc;

              if (!acc[client._id]) {
                acc[client._id] = {
                  ...client,
                  bills: [],
                };
              }
              acc[client._id].bills.push(bill);
              return acc;
            }, {});

            return (
              <div>
                <h2>Manage Billing</h2>
                <div className="form-container">
                  <form onSubmit={handleAddBill}>
                    <h3>Add New Bill</h3>
                    <select name="client" onChange={handleBillChange} value={billData.client} required>
                      <option value="">Select a Client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                      ))}
                    </select>
                    <input type="number" name="amount" placeholder="Amount" value={billData.amount} onChange={handleBillChange} required />
                    <input type="date" name="dueDate" placeholder="Due Date" value={billData.dueDate} onChange={handleBillChange} required />
                    <textarea name="description" placeholder="Description" value={billData.description} onChange={handleBillChange}></textarea>
                    <button type="button" onClick={handleGenerateBillDescription} className="btn btn-secondary">Generate with AI</button>
                    <button type="submit" className="btn btn-primary">Add Bill</button>
                  </form>
                </div>

                <h3>All Bills by Client</h3>
                {Object.values(billsByClient).map(client => {
                  const totalBilled = client.bills.reduce((sum, bill) => sum + bill.amount, 0);
                  const totalPaid = client.bills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);
                  const remainingBudget = (client.totalBudget || 0) - totalPaid;

                  return (
                    <div key={client._id} className="client-billing-section">
                      <h4>{client.clientName} - {client.projectName}</h4>
                      <div className="billing-summary admin-summary">
                        <div className="summary-card">
                          <h5>Total Budget</h5>
                          <p>₹{client.totalBudget ? client.totalBudget.toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="summary-card">
                          <h5>Total Billed</h5>
                          <p>₹{totalBilled.toLocaleString()}</p>
                        </div>
                        <div className="summary-card">
                          <h5>Total Paid</h5>
                          <p>₹{totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="summary-card remaining">
                          <h5>Remaining Budget</h5>
                          <p>₹{remainingBudget.toLocaleString()}</p>
                        </div>
                      </div>

                      <table>
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {client.bills.map((bill) => (
                            <React.Fragment key={bill._id}>
                              <tr>
                                <td>
                                  <p>Total: ₹{bill.amount}</p>
                                  <p>Paid: ₹{bill.paidAmount || 0}</p>
                                </td>
                                <td>{bill.description}</td>
                                <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                                <td>{bill.status}</td>
                                <td>
                                  {bill.status === 'Unpaid' && (
                                    <button onClick={() => handleMarkAsPaid(bill._id)} className="btn btn-success">Mark as Paid</button>
                                  )}
                                  {bill.status === 'Verification Pending' && (
                                    <button onClick={() => setExpandedBill(expandedBill === bill._id ? null : bill._id)} className="btn btn-primary">
                                      {expandedBill === bill._id ? 'Hide' : 'Show'} Pending
                                    </button>
                                  )}
                                  {bill.status === 'Paid' && (
                                    <button onClick={() => handlePaymentNotDone(bill._id)} className="btn btn-danger">Mark Unpaid</button>
                                  )}
                                  <button onClick={() => handleDownloadBill(bill)} className="btn btn-info">Download</button>
                                </td>
                              </tr>
                              {expandedBill === bill._id && bill.pendingPayments && bill.pendingPayments.length > 0 && (
                                <tr>
                                  <td colSpan="5">
                                    <div className="pending-payments">
                                      <h4>Pending Payments</h4>
                                      <ul>
                                        {bill.pendingPayments.map(p => (
                                          <li key={p._id}>
                                            <span>Amount: ₹{p.amount}</span>
                                            <span>ID: {p.transactionId}</span>
                                            <span>
                                              <button onClick={() => handleApprovePayment(bill._id, p._id)} className="btn btn-success">Approve</button>
                                              <button onClick={() => handleRejectPayment(bill._id, p._id)} className="btn btn-danger">Reject</button>
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {location.pathname === '/admin/srs-generator' && (
            <div>
              <h2>SRS Generator</h2>
              <div className="form-container">
                <form onSubmit={handleGenerateSrs}>
                  <h3>Generate New SRS</h3>
                  <select onChange={(e) => handleClientSelect(e.target.value)} value={selectedClientId}>
                    <option value="">Select a Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.clientName} - {client.projectName}</option>
                    ))}
                  </select>
                  <input type="text" name="projectName" placeholder="Project Name" value={localSrsData.projectName} onChange={handleSrsChange} required />
                  <textarea name="projectDescription" placeholder="Project Description" value={localSrsData.projectDescription} onChange={handleSrsChange}></textarea>
                  <textarea name="targetAudience" placeholder="Target Audience" value={localSrsData.targetAudience} onChange={handleSrsChange}></textarea>
                  <textarea name="functionalRequirements" placeholder="Functional Requirements" value={localSrsData.functionalRequirements} onChange={handleSrsChange}></textarea>
                  <textarea name="nonFunctionalRequirements" placeholder="Non-Functional Requirements" value={localSrsData.nonFunctionalRequirements} onChange={handleSrsChange}></textarea>
                  <button type="submit" className="btn btn-primary">
                    Generate SRS
                  </button>
                </form>
              </div>
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