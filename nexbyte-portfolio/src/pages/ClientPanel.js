import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ProjectTracker from '../components/ProjectTracker'; // Import ProjectTracker
import './ClientPanel.css';

const ClientPanel = () => {
  const [data, setData] = useState(null);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'srs'
  const [message, setMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSrsModalOpen, setIsSrsModalOpen] = useState(false);
  const [selectedProjectSrs, setSelectedProjectSrs] = useState(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePayNow = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
    setIsProcessingPayment(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageStatus('error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/client/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Password changed successfully');
        setMessageStatus('success');
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(data.message || 'Failed to change password');
        setMessageStatus('error');
      }
    } catch (err) {
      setMessage('Server error. Please try again.');
      setMessageStatus('error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found, please log in.');
          return;
        }

        const res = await fetch('/api/client/data', {
          headers: {
            'x-auth-token': token,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch client data. Please check your network connection and login status.');
        }

        const clientData = await res.json();
        setData(clientData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const resolvedClientId = data?.clientData?._id || data?.clientData?.id;

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      if (resolvedClientId) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/clients/${resolvedClientId}/projects`, {
            headers: {
              'x-auth-token': token,
            },
          });

          if (!res.ok) {
            throw new Error('Failed to fetch projects');
          }

          const projectsData = await res.json();
          setProjects(projectsData);
        } catch (err) {
          console.error('Failed to fetch projects:', err);
        }
      }
    };

    fetchProjects();
  }, [resolvedClientId]);

  useEffect(() => {
    const fetchBills = async () => {
      if (activeView === 'billing' && data) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/bills/client/${data.clientData.id}`, {
            headers: {
              'x-auth-token': token,
            },
          });

          if (!res.ok) {
            throw new Error('Failed to fetch bills');
          }

          const billsData = await res.json();
          setBills(billsData);
        } catch (err) {
          setError(err.message);
        }
      }
    };

    fetchBills();
  }, [activeView, data]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMessageStatus('Sending...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/client/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const result = await res.json();
      setMessageStatus(result.message);
      setMessage('');
    } catch (err) {
      setMessageStatus(err.message);
    }
  };

  const loadRazorpayCheckout = () => {
    if (window.Razorpay) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    if (!selectedBill) {
      return;
    }

    setIsProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout');
      }

      const orderRes = await fetch(`/api/bills/${selectedBill._id}/razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'NexByte',
        description: `Bill payment for ${selectedBill._id}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`/api/bills/${selectedBill._id}/verify-razorpay-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
              },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            setBills((currentBills) =>
              currentBills.map((bill) => (bill._id === verifyData._id ? verifyData : bill))
            );
            setMessageStatus('Payment completed successfully.');
            closeModal();
          } catch (verifyError) {
            setMessageStatus(verifyError.message || 'Payment verification failed');
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: data?.clientData?.name || '',
          email: data?.clientData?.email || '',
          contact: data?.clientData?.phone || '',
        },
        notes: {
          billId: selectedBill._id,
        },
        theme: {
          color: '#1f7a8c',
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        const description = response?.error?.description || 'Payment failed';
        setMessageStatus(description);
        setIsProcessingPayment(false);
      });
      razorpay.open();
    } catch (err) {
      setMessageStatus(err.message);
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadBill = (bill) => {
    if (bill.invoiceFile) {
      window.open(bill.invoiceFile, '_blank');
      return;
    }
    if (!data || !data.clientData) {
      alert('Client data is not yet loaded. Please wait a moment and try again.');
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
                <img src="/logobill.jpg" alt="Nexbyte_Core Logo" style="max-width: 180px;">
            </div>
            <div class="company-details">
                <h1>INVOICE</h1>
            </div>
        </header>
        <section class="details">
            <div class="client-details">
                <strong>BILL TO:</strong>
                <div>${data.clientData.contactPerson}</div>
                <div>${data.clientData.name}</div>
                <div>${data.clientData.billingAddress || 'N/A'}</div>
                <div>${data.clientData.email}</div>
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
            <div>Thank you for choosing Nexbyte_Core!</div>
        </footer>
    </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin:       0,
      filename:     `invoice_${bill._id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#161b22' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save();
  };

  if (error) {
    return (
      <div className="client-panel-error" style={{ padding: '20px', margin: '20px', border: '1px solid red', backgroundColor: '#ffebeb' }}>
        <h2 style={{ color: '#d8000c' }}>An Error Occurred</h2>
        <p>{error}</p>
        <p><strong>Troubleshooting Tips:</strong></p>
        <ul>
          <li>Please ensure you are logged in with a client account.</li>
          <li>If this is a new deployment, please verify that the environment variables (e.g., <code>MONGODB_URI</code>, <code>JWT_SECRET</code>) are correctly set in your hosting environment (like Vercel).</li>
          <li>Check your internet connection.</li>
        </ul>
      </div>
    );
  }

  if (!data) {
    return <div className="client-panel-loading">Loading...</div>;
  }

  const renderDashboard = () => (
    <div className="client-data">
      {projects.length > 0 ? projects.map(project => (
        <div key={project._id} style={{ marginBottom: '40px', padding: '20px', border: '1px solid #30363d', borderRadius: '8px', backgroundColor: '#161b22' }}>
          <h2>Project: {project.projectName}</h2>
          <ProjectTracker currentMilestone={project.milestone} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
            <p><strong>Type:</strong> {project.projectType}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Requirements:</strong> {project.projectRequirements}</p>
            <p><strong>Due Date:</strong> {new Date(project.projectDeadline).toLocaleDateString()}</p>
          </div>
        </div>
      )) : <p>No projects found.</p>}
    </div>
  );

  const renderBilling = () => {
    const totalPaid = bills.reduce((acc, bill) => acc + (bill.paidAmount || 0), 0);
    const totalBilled = bills.reduce((acc, bill) => acc + (bill.amount || 0), 0);
    const remainingBudget = data.clientData.totalBudget - totalPaid;

    return (
      <div className="billing-view">
        <h2>Billing Information</h2>

        <div className="billing-summary">
          <div className="summary-card">
            <h4>Total Budget</h4>
            <p>₹{data.clientData.totalBudget ? data.clientData.totalBudget.toLocaleString() : 'N/A'}</p>
          </div>
          <div className="summary-card">
            <h4>Total Billed</h4>
            <p>₹{totalBilled.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h4>Total Paid</h4>
            <p>₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="summary-card remaining">
            <h4>Remaining Budget</h4>
            <p>₹{remainingBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className="bills-list">
          {bills.map((bill) => {
            let status = bill.status;
            if (status === 'Unpaid' && new Date(bill.dueDate) < new Date()) {
              status = 'Overdue';
            }

            return (
              <div key={bill._id} className={`bill-card ${status.toLowerCase()}`}>
                <div className="bill-header">
                  <h3>{data.clientData.project}</h3>
                  <span>{bill._id}</span>
                </div>
                <div className="bill-details">
                  <p><strong>Bill Amount:</strong> ₹{bill.amount}</p>
                  <p><strong>Amount Paid:</strong> ₹{bill.paidAmount || 0}</p>
                  <p><strong>Due Date:</strong> {new Date(bill.dueDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className={`status ${status.toLowerCase()}`}>{status}</span></p>
                </div>
                  <div className="bill-actions">
                    {status !== 'Paid' && (
                      <button className="pay-now-btn" onClick={() => handlePayNow(bill)}>Pay Now</button>
                    )}
                    <button className="download-btn" onClick={() => handleDownloadBill(bill)}>Download Bill</button>
                  </div>
              </div>
            );
          })}
          {bills.length === 0 && (
            <div className="no-bills">
              <p>You have no outstanding bills.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="profile-view">
      <h2>Profile Information</h2>
      <div className="profile-info">
        <p><strong>Client Name:</strong> {data.clientData.name}</p>
        <p><strong>Contact Person:</strong> {data.clientData.contactPerson}</p>
        <p><strong>Email:</strong> {data.clientData.email}</p>
        <p><strong>Project:</strong> {data.clientData.project}</p>
      </div>
      <div className="password-section">
        <h3>Change Password</h3>
        <button onClick={() => setShowPasswordChange(true)} className="change-password-btn">
          Change Password
        </button>
      </div>
      {message && (
        <div className={`message ${messageStatus}`}>
          {message}
        </div>
      )}
    </div>
  );

  const handleDownloadSrs = (project) => {
    if (!project || !project.srsDocument) {
      alert('SRS document is not available for this project.');
      return;
    }
    window.open(project.srsDocument, '_blank');
  };

  const renderSrs = () => (
    <div className="srs-view">
      <h2>Software Requirement Specifications</h2>
      {projects.length > 0 ? projects.map(project => (
        <div key={project._id} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #30363d', borderRadius: '8px' }}>
          <h3>{project.projectName}</h3>
          {project.srsDocument ? (
            <div className="srs-actions">
              <button className="download-btn" onClick={() => handleDownloadSrs(project)}>
                Download / View SRS
              </button>
            </div>
          ) : (
            <p>No SRS document uploaded for this project yet.</p>
          )}
        </div>
      )) : <p>No projects found.</p>}
      <div className="message-section" style={{ marginTop: '40px' }}>
        <h3>Request Changes or Send a Message</h3>
        <form onSubmit={handleSendMessage}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows="5"
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>
        {messageStatus && <p>{messageStatus}</p>}
      </div>
    </div>
  );

  return (
    <div className="client-panel-container">
      <div className="sidebar">
        <h2>Client Panel</h2>
        <ul>
          <li onClick={() => setActiveView('dashboard')} className={activeView === 'dashboard' ? 'active' : ''}>
            Dashboard
          </li>
          <li onClick={() => setActiveView('srs')} className={activeView === 'srs' ? 'active' : ''}>
            SRS Document
          </li>
          <li onClick={() => setActiveView('billing')} className={activeView === 'billing' ? 'active' : ''}>
            Billing
          </li>
          <li onClick={() => setActiveView('profile')} className={activeView === 'profile' ? 'active' : ''}>
            Profile
          </li>
        </ul>
      </div>
      <div className="main-content">
        <h1>{data.message}</h1>
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'srs' && renderSrs()}
        {activeView === 'billing' && renderBilling()}
        {activeView === 'profile' && renderProfile()}
        {isSrsModalOpen && (
          <Modal isOpen={isSrsModalOpen} onClose={closeSrsModal}>
            <div className="srs-modal">
              <h2>Software Requirement Specification</h2>
              <pre>{data.clientData.srsDocument}</pre>
            </div>
          </Modal>
        )}
        {isModalOpen && selectedBill && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="manual-payment-modal">
              <h2>Complete Payment</h2>
              <p>Proceed with Razorpay secure checkout to pay this bill.</p>
              <div className="transaction-id-input">
                <label>Amount Due</label>
                <input
                  type="text"
                  value={`₹${Math.max((selectedBill.amount || 0) - (selectedBill.paidAmount || 0), 0).toFixed(2)}`}
                  readOnly
                />
              </div>
              <div className="transaction-id-input">
                <label>Payment Method</label>
                <input
                  type="text"
                  value="Razorpay Secure Checkout"
                  readOnly
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessingPayment}>
                  {isProcessingPayment ? 'Processing...' : 'Continue to Razorpay'}
                </button>
                <button onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </Modal>
        )}
        {showPasswordChange && (
          <Modal isOpen={showPasswordChange} onClose={() => setShowPasswordChange(false)}>
            <div className="password-change-modal">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="password-input">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="password-input">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="password-input">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit">Change Password</button>
                  <button type="button" onClick={() => setShowPasswordChange(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ClientPanel;
