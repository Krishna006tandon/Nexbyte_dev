import React, { useState, useEffect } from 'react';
import './ClientPanel.css';

const ClientPanel = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'srs'
  const [message, setMessage] = useState('');
  const [messageStatus, setMessageStatus] = useState('');

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

  const renderBilling = () => {
    const bills = [
      { id: 'NEX-001', project: 'E-commerce Website', date: '2024-07-20', amount: '₹50,000', status: 'Paid' },
      { id: 'NEX-002', project: 'Mobile App Development', date: '2024-08-15', amount: '₹80,000', status: 'Unpaid' },
      { id: 'NEX-003', project: 'SEO Optimization', date: '2024-09-01', amount: '₹25,000', status: 'Unpaid' },
    ];

    return (
      <div className="billing-view">
        <h2>Billing Information</h2>
        <div className="bills-list">
          {bills.map((bill) => (
            <div key={bill.id} className={`bill-card ${bill.status.toLowerCase()}`}>
              <div className="bill-header">
                <h3>{bill.project}</h3>
                <span>{bill.id}</span>
              </div>
              <div className="bill-details">
                <p><strong>Date:</strong> {bill.date}</p>
                <p><strong>Amount:</strong> {bill.amount}</p>
                <p><strong>Status:</strong> <span className={`status ${bill.status.toLowerCase()}`}>{bill.status}</span></p>
              </div>
              {bill.status === 'Unpaid' && (
                <div className="bill-actions">
                  <button className="pay-now-btn">Pay Now</button>
                </div>
              )}
            </div>
          ))}
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
      </div>
    </div>
  );
};

export default ClientPanel;