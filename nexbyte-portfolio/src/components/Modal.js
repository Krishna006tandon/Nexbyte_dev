import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  if (!isOpen) return null;

  const sizeClass = typeof size === 'string' ? `modal-size-${size}` : 'modal-size-md';

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className={`modal-content ${sizeClass}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('root')
  );
};

export default Modal;
