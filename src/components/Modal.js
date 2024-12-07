import React from 'react';
import './Modal.css';

function Modal({ onClose, title, children }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>{title}</h2>
                <div>{children}</div>
            </div>
        </div>
    );
}

export default Modal;
