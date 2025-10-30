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
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
            background: #FFF;
            text-align: left;
            font-size: 14px;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
        }
        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }
        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }
        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }
        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }
        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }
        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }
        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.item td{
            border-bottom: 1px solid #eee;
        }
        .invoice-box table tr.item.last td {
            border-bottom: none;
        }
        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
        @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
                width: 100%;
                display: block;
                text-align: center;
            }
            .invoice-box table tr.information table td {
                width: 100%;
                display: block;
                text-align: center;
            }
        }
        .rtl {
            direction: rtl;
            font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        }
        .rtl table {
            text-align: right;
        }
        .rtl table tr td:nth-child(2) {
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                <img src="/logobill.jpg" style="width:100%; max-width:300px;">
                            </td>
                            <td>
                                Invoice #: ${bill._id}<br>
                                Created: ${new Date().toLocaleDateString()}<br>
                                Due: ${new Date(bill.dueDate).toLocaleDateString()}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                NexByte Dev, Inc.<br>
                                nexbyte.dev@gmail.com
                            </td>
                            <td>
                                ${data.clientData.name}<br>
                                ${data.clientData.contactPerson}<br>
                                ${data.clientData.email}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="heading">
                <td>
                    Payment Method
                </td>
                <td>
                    Check #
                </td>
            </tr>
            <tr class="details">
                <td>
                    Check
                </td>
                <td>
                    1000
                </td>
            </tr>
            <tr class="heading">
                <td>
                    Item
                </td>
                <td>
                    Price
                </td>
            </tr>
            <tr class="item">
                <td>
                    ${bill.description}
                </td>
                <td>
                    ₹${bill.amount.toFixed(2)}
                </td>
            </tr>
            <tr class="total">
                <td></td>
                <td>
                   Total: ₹${bill.amount.toFixed(2)}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin:       0,
      filename:     `invoice_${bill._id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: '#1a1a1a' },
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
                {status !== 'Paid' && (
                  <div className="bill-actions">
                    <button className="pay-now-btn" onClick={() => handlePayNow(bill)}>Pay Now</button>
                    <button className="download-btn" onClick={() => handleDownloadBill(bill)}>Download Bill</button>
                  </div>
                )}
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

  const renderSrs = () => (
    <div className="srs-view">
      <h2>Software Requirement Specification</h2>
      {data.clientData.srsDocument ? (
        <>
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
