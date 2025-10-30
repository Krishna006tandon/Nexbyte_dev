import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [transactionId, setTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [milestone, setMilestone] = useState(null); // Add state for milestone
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSrsModalOpen, setIsSrsModalOpen] = useState(false);

  const handlePayNow = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
    setTransactionId('');
    setPaidAmount('');
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

  // Fetch milestone data
  useEffect(() => {
    const fetchMilestone = async () => {
      if (data && data.clientData) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/clients/${data.clientData.id}/milestone`, {
            headers: {
              'x-auth-token': token,
            },
          });

          if (!res.ok) {
            throw new Error('Failed to fetch milestone');
          }

          const clientWithMilestone = await res.json();
          setMilestone(clientWithMilestone.milestone);
        } catch (err) {
          // Don't block the UI for this, just log the error
        }
      }
    };

    fetchMilestone();
  }, [data]);

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

  const handleConfirmPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bills/${selectedBill._id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ transactionId, amount: paidAmount }),
      });

      if (!res.ok) {
        throw new Error('Failed to confirm payment');
      }

      setMessageStatus('Payment confirmation received. We will update your data shortly.');

      // Update the bill status in the local state
      setBills(bills.map(b => b._id === selectedBill._id ? { ...b, status: 'Verification Pending' } : b));

      closeModal();
    } catch (err) {
      setMessageStatus(err.message);
    }
  };

  const handleDownloadBill = (bill) => {
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
                <img src="/logobill.jpg" alt="NexByte_Dev Logo" style="max-width: 180px;">
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
      {milestone && <ProjectTracker currentMilestone={milestone} />}
      <h2>Project Details</h2>
      <p><strong>Project:</strong> {data.clientData.project}</p>
      <p><strong>Status:</strong> {data.clientData.status}</p>
      <p><strong>Due Date:</strong> {data.clientData.dueDate}</p>
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

  const handleDownloadSrs = () => {
    if (!data || !data.clientData || !data.clientData.srsDocument) {
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
            <pre>${data.clientData.srsDocument}</pre>
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
      filename:     `srs_${data.clientData.project}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save().then(() => {
        setIsDownloading(false);
    });
  };

  const handleSeeSrs = () => {
    if (!data || !data.clientData || !data.clientData.srsDocument) {
      alert('SRS data is not yet loaded. Please wait a moment and try again.');
      return;
    }
    setIsSrsModalOpen(true);
  }

  const closeSrsModal = () => {
    setIsSrsModalOpen(false);
  }

  const renderSrs = () => (
    <div className="srs-view">
      <h2>Software Requirement Specification</h2>
      {data.clientData.srsDocument ? (
        <>
          <div className="srs-actions">
            <button className="download-btn" onClick={handleDownloadSrs} disabled={isDownloading}>
              {isDownloading ? 'Downloading...' : 'Download SRS'}
            </button>
            <button className="see-btn" onClick={handleSeeSrs}>See SRS</button>
          </div>
          <pre className="srs-content">{data.clientData.srsDocument}</pre>
          <div className="message-section">
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
        </>
      ) : (
        <p>The SRS document is not yet available.</p>
      )}
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
        </ul>
      </div>
      <div className="main-content">
        <h1>{data.message}</h1>
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'srs' && renderSrs()}
        {activeView === 'billing' && renderBilling()}
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
              <h2>Manual Payment</h2>
              <p>Scan the QR code with your UPI app to pay.</p>
              <div className="qr-code-container">
                <QRCodeSVG
                  value={
                    `upi://pay?pa=9175603240@upi&pn=Nexbyte&tn=Payment for ${data.clientData.project} - Bill ${selectedBill._id}`
                  }
                />
              </div>
              <div className="transaction-id-input">
                <label htmlFor="paidAmount">Amount Paid</label>
                <input
                  type="number"
                  id="paidAmount"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Enter the amount you paid"
                  required
                />
              </div>
              <div className="transaction-id-input">
                <label htmlFor="transactionId">Transaction ID</label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.trim())}
                  placeholder="Enter the transaction ID from your UPI app"
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={handleConfirmPayment}
                  disabled={!transactionId || !paidAmount}>
                  Confirm Payment</button>
                <button onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ClientPanel;
