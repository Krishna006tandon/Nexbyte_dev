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
  const [milestone, setMilestone] = useState(null); // Add state for milestone

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
          console.error("Error fetching milestone:", err.message);
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


  const handleDownloadBill = (bill) => {
    function generateDarkThemeInvoice(bill, data) {
    // Main invoice container
    const invoice = document.createElement('div');
    invoice.style.maxWidth = '800px';
    invoice.style.margin = 'auto';
    invoice.style.padding = '30px';
    invoice.style.backgroundColor = '#222222'; /* Matte Black/Dark Charcoal */
    invoice.style.border = '1px solid #333';
    invoice.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.7)';
    invoice.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    invoice.style.color = '#ccc'; /* Light Grey Text */
    invoice.style.position = 'relative'; /* For watermark */
    invoice.style.boxSizing = 'border-box'; /* Ensures padding doesn't push width over */

    // Background body style (optional, if you want to apply to parent)
    document.body.style.backgroundColor = '#1a1a1a'; /* Dark Graphite */
    document.body.style.color = '#ccc';
    document.body.style.margin = '0';
    document.body.style.padding = '20px';


    // Watermark (as per your original request)
    const watermark = document.createElement('div');
    watermark.textContent = 'NexByte_Dev'; // Changed watermark text to company name
    watermark.style.position = 'absolute';
    watermark.style.top = '50%';
    watermark.style.left = '50%';
    watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)';
    watermark.style.fontSize = '80px'; /* Slightly smaller for better fit */
    watermark.style.color = 'rgba(200, 200, 200, 0.05)'; /* Lighter but very transparent */
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '0'; /* Ensure it's in the background */
    invoice.appendChild(watermark);


    // Header Section
    const headerDiv = document.createElement('header');
    headerDiv.style.display = 'flex';
    headerDiv.style.justifyContent = 'space-between';
    headerDiv.style.alignItems = 'flex-start';
    headerDiv.style.marginBottom = '40px';

    // Logo (using the black and grey logo generated)
    const logoDiv = document.createElement('div');
    logoDiv.style.maxWidth = '180px';
    const logoImg = document.createElement('img');
    logoImg.src = 'F:/Projects/Nexbyte_dev/nexbyte-portfolio/public/logobill.jpg'; // Replace with the actual URL of your preferred logo
    logoImg.alt = 'NexByte_Dev Logo';
    logoImg.style.maxWidth = '180px';
    logoImg.style.height = 'auto'; // Ensure aspect ratio is maintained
    logoImg.style.zIndex = '1'; // Ensure logo is above watermark
    logoDiv.appendChild(logoImg);
    headerDiv.appendChild(logoDiv);

    // Company Details
    const companyDetailsDiv = document.createElement('div');
    companyDetailsDiv.style.textAlign = 'right';
    companyDetailsDiv.style.fontSize = '0.9em';
    companyDetailsDiv.style.color = '#bbb';
    companyDetailsDiv.style.zIndex = '1';

    const invoiceTitle = document.createElement('h1');
    invoiceTitle.textContent = 'INVOICE';
    invoiceTitle.style.margin = '0';
    invoiceTitle.style.color = '#eee';
    invoiceTitle.style.fontSize = '2em';
    companyDetailsDiv.appendChild(invoiceTitle);

    const companyName = document.createElement('div');
    companyName.textContent = 'NexByte_Dev';
    companyDetailsDiv.appendChild(companyName);

    const companyAddress1 = document.createElement('div');
    companyAddress1.textContent = '123 Tech Street, Silicon Nagpur';
    companyDetailsDiv.appendChild(companyAddress1);

    const companyAddress2 = document.createElement('div');
    companyAddress2.textContent = 'Nagpur, MH 440001';
    companyDetailsDiv.appendChild(companyAddress2);

    const companyEmail = document.createElement('div');
    companyEmail.textContent = 'info@nexbytedev.com';
    companyDetailsDiv.appendChild(companyEmail);

    headerDiv.appendChild(companyDetailsDiv);
    invoice.appendChild(headerDiv);


    // Client Info and Invoice Details Section
    const detailsSection = document.createElement('section');
    detailsSection.style.display = 'flex';
    detailsSection.style.justifyContent = 'space-between';
    detailsSection.style.marginBottom = '40px';
    detailsSection.style.fontSize = '0.9em';
    detailsSection.style.zIndex = '1';

    // Client Details
    const clientDetailsDiv = document.createElement('div');
    clientDetailsDiv.style.color = '#bbb';
    
    const billToStrong = document.createElement('strong');
    billToStrong.textContent = 'BILL TO:';
    billToStrong.style.color = '#ddd';
    clientDetailsDiv.appendChild(billToStrong);
    clientDetailsDiv.appendChild(document.createElement('br')); // New line after strong

    const clientName = document.createElement('div');
    clientName.textContent = data.clientData && data.clientData.name ? data.clientData.name : 'Client Name Ltd.';
    clientDetailsDiv.appendChild(clientName);

    const clientProject = document.createElement('div');
    clientProject.textContent = data.clientData && data.clientData.project ? data.clientData.project : 'Project Name'; // Project from your data
    clientDetailsDiv.appendChild(clientProject);

    const clientAddress = document.createElement('div');
    clientAddress.textContent = data.clientData && data.clientData.address ? data.clientData.address : '456 Business Park, Mumbai';
    clientDetailsDiv.appendChild(clientAddress);

    const clientEmail = document.createElement('div');
    clientEmail.textContent = data.clientData && data.clientData.email ? data.clientData.email : 'client@email.com';
    clientDetailsDiv.appendChild(clientEmail);

    detailsSection.appendChild(clientDetailsDiv);

    // Invoice Details
    const invoiceDetailsDiv = document.createElement('div');
    invoiceDetailsDiv.style.textAlign = 'right';

    const createDetailLine = (label, value) => {
        const div = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = label + ':';
        strong.style.display = 'inline-block';
        strong.style.width = '100px';
        strong.style.color = '#ddd';
        div.appendChild(strong);
        div.appendChild(document.createTextNode(` ${value}`));
        return div;
    };
    
    invoiceDetailsDiv.appendChild(createDetailLine('Invoice #', bill._id));
    invoiceDetailsDiv.appendChild(createDetailLine('Date', new Date().toLocaleDateString())); // Current Date
    invoiceDetailsDiv.appendChild(createDetailLine('Due Date', new Date(bill.dueDate).toLocaleDateString()));
    invoiceDetailsDiv.appendChild(createDetailLine('Status', bill.status));

    detailsSection.appendChild(invoiceDetailsDiv);
    invoice.appendChild(detailsSection);

    // Items Table (Example - you'd populate this from your 'data' object)
    const itemsTable = document.createElement('table');
    itemsTable.className = 'items-table'; // For CSS consistency
    itemsTable.style.width = '100%';
    itemsTable.style.borderCollapse = 'collapse';
    itemsTable.style.zIndex = '1';

    // Table Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Description', 'Qty', 'Rate', 'Amount'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.backgroundColor = '#333';
        th.style.color = '#eee';
        th.style.padding = '12px';
        th.style.textAlign = text === 'Description' ? 'left' : 'right';
        th.style.borderBottom = '2px solid #444';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    itemsTable.appendChild(thead);

    // Table Body (Example items)
    const tbody = document.createElement('tbody');
    // Replace this with a loop through your actual bill items
    const exampleItems = data.items || [ // Assuming data.items array exists
        { description: 'E-commerce Website Development', details: '(Frontend & Backend Integration)', qty: 1, rate: 80000, amount: 80000 },
        { description: 'Custom API Development', qty: 10, rate: 2000, amount: 20000 },
        { description: 'Monthly Server Maintenance', qty: 1, rate: 5000, amount: 5000 }
    ];

    exampleItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = (index === exampleItems.length - 1) ? 'none' : '1px solid #444';

        const descTd = document.createElement('td');
        descTd.className = 'description';
        descTd.style.padding = '12px';
        descTd.style.verticalAlign = 'top';
        descTd.style.color = '#ddd';

        const strongDesc = document.createElement('strong');
        strongDesc.textContent = item.description;
        descTd.appendChild(strongDesc);
        if (item.details) {
            const detailsDiv = document.createElement('div');
            detailsDiv.textContent = item.details;
            detailsDiv.style.fontSize = '0.9em';
            detailsDiv.style.color = '#bbb';
            descTd.appendChild(detailsDiv);
        }
        tr.appendChild(descTd);

        const qtyTd = document.createElement('td');
        qtyTd.className = 'qty';
        qtyTd.textContent = item.qty;
        qtyTd.style.padding = '12px';
        qtyTd.style.verticalAlign = 'top';
        qtyTd.style.textAlign = 'right';
        tr.appendChild(qtyTd);

        const rateTd = document.createElement('td');
        rateTd.className = 'rate';
        rateTd.textContent = `₹${item.rate.toLocaleString()}`;
        rateTd.style.padding = '12px';
        rateTd.style.verticalAlign = 'top';
        rateTd.style.textAlign = 'right';
        tr.appendChild(rateTd);

        const amountTd = document.createElement('td');
        amountTd.className = 'amount';
        amountTd.textContent = `₹${item.amount.toLocaleString()}`;
        amountTd.style.padding = '12px';
        amountTd.style.verticalAlign = 'top';
        amountTd.style.textAlign = 'right';
        tr.appendChild(amountTd);

        tbody.appendChild(tr);
    });
    itemsTable.appendChild(tbody);
    invoice.appendChild(itemsTable);


    // Total Section
    const totalSection = document.createElement('section');
    totalSection.style.marginTop = '20px';
    totalSection.style.paddingTop = '10px';
    totalSection.style.borderTop = '2px solid #555';
    totalSection.style.textAlign = 'right';
    totalSection.style.zIndex = '1';

    const createTotalLine = (label, value, isGrandTotal = false) => {
        const div = document.createElement('div');
        div.style.fontSize = isGrandTotal ? '1.5em' : '1.1em';
        div.style.marginBottom = '8px';
        div.style.color = isGrandTotal ? '#eee' : '#ddd';

        const strong = document.createElement('strong');
        strong.textContent = label + ':';
        strong.style.display = 'inline-block';
        strong.style.width = '150px';
        strong.style.color = isGrandTotal ? '#eee' : '#ccc';
        div.appendChild(strong);
        div.appendChild(document.createTextNode(` ₹${value.toLocaleString()}`));
        return div;
    };

    // Calculate subtotal, GST, and total for example
    let subtotal = exampleItems.reduce((sum, item) => sum + item.amount, 0);
    let gstRate = 0.18;
    let gstAmount = subtotal * gstRate;
    let totalDue = subtotal + gstAmount;


    totalSection.appendChild(createTotalLine('Subtotal', subtotal));
    totalSection.appendChild(createTotalLine('GST (18%)', Math.round(gstAmount)));
    totalSection.appendChild(createTotalLine('TOTAL DUE', totalDue, true));

    invoice.appendChild(totalSection);


    // Footer
    const footerDiv = document.createElement('footer');
    footerDiv.style.marginTop = '40px';
    footerDiv.style.paddingTop = '20px';
    footerDiv.style.borderTop = '1px solid #444';
    footerDiv.style.fontSize = '0.8em';
    footerDiv.style.color = '#aaa';
    footerDiv.style.textAlign = 'center';
    footerDiv.style.zIndex = '1';

    const paymentTerms = document.createElement('div');
    paymentTerms.textContent = 'Payment due within 15 days.';
    footerDiv.appendChild(paymentTerms);

    const gratitude = document.createElement('div');
    gratitude.textContent = 'Thank you for choosing NexByte_Dev!';
    footerDiv.appendChild(gratitude);

    invoice.appendChild(footerDiv);

    // Append the generated invoice to the body (or a specific container)
    // document.body.appendChild(invoice); // Uncomment this if you want to see it directly in the browser

    // html2pdf options (unchanged from your original code)
    const options = {
        margin: 1,
        filename: `bill_${bill._id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#1a1a1a' }, // Ensure dark background is captured
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Use a temporary div to generate PDF if not appending to body
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(invoice);
    document.body.appendChild(tempContainer); // Temporarily add to body for html2pdf to work correctly

    window.html2pdf().from(tempContainer).set(options).save().then(() => {
        document.body.removeChild(tempContainer); // Remove after saving
    });
}

// --- Example Usage ---
// Make sure you have html2pdf.js library included in your project:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>

// Sample 'bill' and 'data' objects
const sampleBill = {
    _id: 'NBD-INV-001',
    amount: 123900,
    dueDate: '2025-11-10',
    status: 'Pending'
};

const sampleData = {
    clientData: {
        name: 'Tech Solutions Inc.',
        project: 'E-commerce Platform',
        address: '789 Innovation Drive, Bengaluru',
        email: 'contact@techsolutions.com'
    },
    items: [
        { description: 'Frontend Development (React)', details: '(Custom UI/UX Implementation)', qty: 1, rate: 50000, amount: 50000 },
        { description: 'Backend API Development (Node.js)', qty: 1, rate: 60000, amount: 60000 },
        { description: 'Database Setup & Optimization', qty: 1, rate: 10000, amount: 10000 }
    ]
    // You can add more fields here as needed
};

// Call the function to generate and save the PDF
// generateDarkThemeInvoice(sampleBill, sampleData); // Uncomment to test

  if (error) {
    return <div className="client-panel-error">{error}</div>;
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
};};

export default ClientPanel;