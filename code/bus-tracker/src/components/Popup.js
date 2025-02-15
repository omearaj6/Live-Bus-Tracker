import React from 'react';
import './Popup.css';

const Popup = ({ onClose }) => {
  const handleYesClick = () => {
    onClose('yes');
  };

  const handleNoClick = () => {
    onClose('no');
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>Has your bus arrived yet?</h2>
        <div className="popup-buttons">
          <button className="popup-button" onClick={handleYesClick}>
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
