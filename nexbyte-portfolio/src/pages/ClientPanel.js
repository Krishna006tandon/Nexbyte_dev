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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        /* Global Reset & Base Typography */
        body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            color: #334155;
            line-height: 1.55;
            font-size: 10pt;
            margin: 0;
            max-width: 820px;
            padding: 20px;
            background-color: #ffffff;
        }

        /* Executive Premium Invoice Header */
        .invoice-header {
            background-color: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #ffffff !important;
            padding: 40px;
            border-radius: 8px 8px 0 0;
            border-bottom: 6px solid #2563eb !important;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .company-brand h1 {
            font-size: 22pt;
            line-height: 1.1;
            margin: 0 0 5px 0;
            font-weight: 700;
            letter-spacing: -0.5px;
            color: #ffffff !important;
        }
        
        .company-brand p {
            margin: 0;
            font-size: 9.5pt;
            color: #94a3b8 !important;
        }
        
        .invoice-title-block {
            text-align: right;
        }
        
        .invoice-title-block h2 {
            font-size: 22pt;
            font-weight: 700;
            margin: 0 0 8px 0;
            letter-spacing: 0.5px;
            color: #ffffff !important;
            border-bottom: none;
            padding-bottom: 0;
        }
        
        /* Unpaid Status Badge */
        .status-badge {
            display: inline-block;
            background-color: ${bill.status === 'Paid' ? '#059669' : '#dc2626'} !important;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 6px 16px;
            border-radius: 4px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Details Information Container */
        .details-container {
            display: flex;
            justify-content: space-between;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            padding: 30px 40px;
            background-color: #f8fafc;
        }
        
        .billing-block {
            width: 48%;
        }
        
        .billing-block h3 {
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #2563eb;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        
        .billing-block p {
            margin: 0 0 4px 0;
            color: #334155;
            font-size: 9.5pt;
        }

        /* Invoice Data Table */
        table.invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0;
            page-break-inside: avoid;
        }
        
        table.invoice-table th {
            background-color: #1e293b !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color: #ffffff !important;
            font-weight: 600;
            text-align: left;
            padding: 12px;
            font-size: 8.5pt;
            border: 1px solid #1e293b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        table.invoice-table td {
            padding: 12px;
            font-size: 9.5pt;
            border: 1px solid #e2e8f0;
            color: #334155;
        }

        /* Summary Wrapper */
        .summary-wrapper {
            display: flex;
            justify-content: flex-end;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            padding: 20px 40px;
            background-color: #ffffff;
        }
        
        .summary-table {
            width: 400px;
            font-size: 9.5pt;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
        }
        
        .summary-total {
            border-top: 2px solid #0f172a;
            padding-top: 10px;
            margin-top: 6px;
            font-weight: 700;
            font-size: 11pt;
            color: #dc2626;
        }

        /* Print Settings */
        @media print {
            @page {
                size: A4;
                margin: 15mm;
            }
            body {
                margin: 0;
                padding: 0;
                background: #ffffff;
            }
            html, body {
                height: auto;
            }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    </style>

    <div class="invoice-box">
        <!-- Executive Invoice Header -->
        <div class="invoice-header">
            <div class="company-brand">
                <h1>Nexbyte Core</h1>
                <p>Web Application &amp; Platform Engineering</p>
            </div>
            <div class="invoice-title-block">
                <h2>INVOICE</h2>
                <div class="status-badge">${bill.status || 'Unpaid'}</div>
            </div>
        </div>

        <!-- Details Container -->
        <div class="details-container">
            <div class="billing-block">
                <h3>Billed To (Client)</h3>
                <p><strong>Name:</strong> ${data.clientData.contactPerson}</p>
                <p><strong>Company:</strong> ${data.clientData.name}</p>
                <p><strong>Project:</strong> ${data.clientData.project}</p>
                <p><strong>Email:</strong> ${data.clientData.email}</p>
                ${data.clientData.billingAddress ? `<p><strong>Address:</strong> ${data.clientData.billingAddress}</p>` : ''}
            </div>
            <div class="billing-block" style="text-align: right;">
                <h3>Invoice Logistics</h3>
                <p><strong>Invoice No:</strong> ${bill._id}</p>
                <p><strong>Date of Issue:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</p>
            </div>
        </div>

        <!-- Itemized Breakdown Table -->
        <table class="invoice-table">
            <thead>
                <tr>
                    <th style="width: 10%;">Item</th>
                    <th style="width: 70%;">Description</th>
                    <th style="width: 20%; text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: 600; color: #334155;">01</td>
                    <td>
                        <strong>${bill.description}</strong>
                    </td>
                    <td style="text-align: right; font-weight: 600; color: #334155;">₹${bill.amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <!-- Financial Summary -->
        <div class="summary-wrapper">
            <div class="summary-table">
                <div class="summary-row">
                    <span style="color: #64748b;">Total Bill Amount:</span>
                    <span style="font-weight: 600; color: #0f172a;">₹${bill.amount.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span style="color: #64748b;">Amount Paid:</span>
                    <span style="font-weight: 600; color: #059669;">₹${(bill.paidAmount || 0).toFixed(2)}</span>
                </div>
                <div class="summary-row summary-total">
                    <span>Amount Due:</span>
                    <span>₹${Math.max((bill.amount || 0) - (bill.paidAmount || 0), 0).toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <!-- Footnote -->
        <p style="text-align: center; margin-top: 40px; font-size: 8.5pt; color: #94a3b8; font-style: italic;">
            Thank you for choosing Nexbyte Core!
        </p>
    </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin:       0,
      filename:     `invoice_${bill._id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#ffffff' },
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
      {projects.length > 0 ? projects.map(project => {
        const projectBills = bills.filter(b => b.project === project._id || (b.project && b.project._id === project._id) || (projects.length === 1 && !b.project));
        const totalPaid = projectBills.reduce((acc, bill) => acc + (bill.paidAmount || 0), 0);
        const totalRemaining = (project.totalBudget || 0) - totalPaid;

        return (
        <div key={project._id} style={{ marginBottom: '40px', padding: '20px', border: '1px solid #30363d', borderRadius: '8px', backgroundColor: '#161b22' }}>
          <h2>Project: {project.projectName}</h2>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
             <div style={{ background: '#21262d', padding: '15px', borderRadius: '8px', flex: 1, border: '1px solid #30363d' }}>
               <h4 style={{ margin: '0 0 10px 0', color: '#8b949e' }}>Total Budget</h4>
               <p style={{ margin: 0, fontSize: '1.5em', color: '#58a6ff' }}>₹{(project.totalBudget || 0).toLocaleString()}</p>
             </div>
             <div style={{ background: '#21262d', padding: '15px', borderRadius: '8px', flex: 1, border: '1px solid #30363d' }}>
               <h4 style={{ margin: '0 0 10px 0', color: '#8b949e' }}>Total Paid</h4>
               <p style={{ margin: 0, fontSize: '1.5em', color: '#3fb950' }}>₹{totalPaid.toLocaleString()}</p>
             </div>
             <div style={{ background: '#21262d', padding: '15px', borderRadius: '8px', flex: 1, border: '1px solid #30363d' }}>
               <h4 style={{ margin: '0 0 10px 0', color: '#8b949e' }}>Remaining</h4>
               <p style={{ margin: 0, fontSize: '1.5em', color: '#f85149' }}>₹{totalRemaining.toLocaleString()}</p>
             </div>
          </div>
          <ProjectTracker currentMilestone={project.milestone} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
            <p><strong>Type:</strong> {project.projectType}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Requirements:</strong> {project.projectRequirements}</p>
            <p><strong>Due Date:</strong> {new Date(project.projectDeadline).toLocaleDateString()}</p>
            <p><strong>Maint. Charge:</strong> ₹{(project.monthlyMaintenanceCharge || 0).toLocaleString()}</p>
          </div>
        </div>
      )}) : <p>No projects found.</p>}
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
