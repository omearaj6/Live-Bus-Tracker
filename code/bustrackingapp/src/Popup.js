import React, { useState } from 'react';
import './Popup.css';

const Popup = ({ onClose }) => {
  const [showBusButton, setShowBusButton] = useState(false);

  const handleNoClick = () => {
    setShowBusButton(true);
  };

  return (
    <>
      {!showBusButton && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2>Has your bus arrived yet?</h2>
            <div className="popup-buttons">
              <button className="popup-button" onClick={onClose}>Yes</button>
              <button className="popup-button" onClick={handleNoClick}>No</button>
            </div>
          </div>
        </div>
      )}
      {showBusButton && (
        <button className="bus-here-button">My bus is here</button>
      )}
    </>
  );
};

export default Popup;