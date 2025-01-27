import React from 'react';
import './Popup.css';

const Popup = ({ onClose, onBusHere }) => {
  const handleNoClick = () => {
    onBusHere();
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Has your bus arrived yet?</h2>
        <div className="popup-buttons">
          <button className="popup-button" onClick={onClose}>
            Yes
          </button>
          <button className="popup-button" onClick={handleNoClick}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
