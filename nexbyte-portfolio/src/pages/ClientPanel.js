import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';import Modal from '../components/Modal';
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

  const handlePayNow = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBill(null);
    setTransactionId('');
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
          throw new Error('Failed to fetch data');
        }

        const clientData = await res.json();
        setData(clientData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

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
    const amountToPay = selectedBill.amount;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bills/${selectedBill._id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ transactionId, amount: amountToPay }),
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

  if (error) {
    return <div className="client-panel-error">{error}</div>;
  }

  if (!data) {
    return <div className="client-panel-loading">Loading...</div>;
  }

  const renderDashboard = () => (
    <div className="client-data">
      <h2>Project Details</h2>
      <p><strong>Project:</strong> {data.clientData.project}</p>
      <p><strong>Status:</strong> {data.clientData.status}</p>
      <p><strong>Due Date:</strong> {data.clientData.dueDate}</p>
    </div>
  );

  const renderBilling = () => (
    <div className="billing-view">
      <h2>Billing Information</h2>
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
                <p><strong>Amount:</strong> ₹{bill.amount}</p>
                <p><strong>Due Date:</strong> {new Date(bill.dueDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`status ${status.toLowerCase()}`}>{status}</span></p>
              </div>
              {status !== 'Paid' && (
                <div className="bill-actions">
                  <button className="pay-now-btn" onClick={() => handlePayNow(bill)}>Pay Now</button>
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
              <p>Scan the QR code with your UPI app to pay ₹{selectedBill.amount}.</p>
              <div className="qr-code-container">
                <QRCodeSVG
                  value={
                    `upi://pay?pa=9175603240@upi&pn=Nexbyte&am=${selectedBill.amount}&tn=Payment for ${data.clientData.project} - Bill ${selectedBill._id}`
                  }
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
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={handleConfirmPayment}
                  disabled={!transactionId}>
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