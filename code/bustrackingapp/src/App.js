import React, { useState } from 'react';
import DCUMap from './DCUMap';
import './App.css';
import Popup from './Popup';

function App() {
  const [showPopup, setShowPopup] = useState(false);

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Bus Tracker</h1>
      </header>
      <main className="App-content">
        <div className="content-wrapper">
          <section className="map-section">
            <h2>Live Map</h2>
            <DCUMap />
          </section>
          <section className="bus-list-section">
            <h2>Available Buses</h2>
            <div className="bus-item">Bus 1</div>
            <div className="bus-item">Bus 2</div>
            <div className="bus-item">Bus 3</div>
            <button className="button" onClick={handlePopupOpen}>Has your bus arrived?</button>
          </section>
        </div>
      </main>
      {showPopup && <Popup onClose={handlePopupClose} />}
    </div>
  );
}

export default App;
