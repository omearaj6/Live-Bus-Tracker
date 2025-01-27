import React, { useState } from 'react';
import DCUMap from './DCUMap';
import './App.css';
import Popup from './Popup';
import Clock from './Clock';

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [showBusHereButton, setShowBusHereButton] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [adjustedStops, setAdjustedStops] = useState(null);
  const [timeDifference, setTimeDifference] = useState(null);

  const busStops = {
    Bus1: [
      { stop: 'Stop 1A', time: '10:30 AM' },
      { stop: 'Stop 1B', time: '10:45 AM' },
      { stop: 'Stop 1C', time: '11:00 AM' },
    ],
    Bus2: [
      { stop: 'Stop 2A', time: '11:15 AM' },
      { stop: 'Stop 2B', time: '11:30 AM' },
      { stop: 'Stop 2C', time: '11:45 AM' },
    ],
    Bus3: [
      { stop: 'Stop 3A', time: '12:00 PM' },
      { stop: 'Stop 3B', time: '12:15 PM' },
      { stop: 'Stop 3C', time: '12:30 PM' },
    ],
  };

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = (answer) => {
    setShowPopup(false);
    if (answer === 'yes') {
      logTime();
    } else if (answer === 'no') {
      setShowBusHereButton(true);
    }
  };

  const handleBusHereButton = () => {
    logTime();
    setShowBusHereButton(false);
  };

  const logTime = () => {
    const now = new Date();
    const actualTime = now.toLocaleTimeString();
    setLastActionTime(actualTime);
  
    if (selectedStop) {
      const scheduledTime = parseTime(selectedStop.time);
  
      const delayInMinutes = Math.round((now - scheduledTime) / (1000 * 60));
  
      const delayHours = Math.floor(Math.abs(delayInMinutes) / 60);
      const delayMinutes = Math.abs(delayInMinutes) % 60;
  
      const differenceString =
        delayInMinutes === 0
          ? 'On time'
          : delayInMinutes > 0
          ? `${delayHours > 0 ? `${delayHours} hour${delayHours > 1 ? 's' : ''} ` : ''}${
              delayMinutes > 0 ? `${delayMinutes} minute${delayMinutes > 1 ? 's' : ''} ` : ''
            }late`
          : `${delayHours > 0 ? `${delayHours} hour${delayHours > 1 ? 's' : ''} ` : ''}${
              delayMinutes > 0 ? `${delayMinutes} minute${delayMinutes > 1 ? 's' : ''} ` : ''
            }early`;
  
      setTimeDifference(differenceString);
  
      if (!adjustedStops) {
        const updatedStops = busStops[selectedBus].map((stop, index) => {
          const stopTime = parseTime(stop.time);
  
          if (busStops[selectedBus].indexOf(selectedStop) <= index) {
            let newTime = new Date(stopTime.getTime() + delayInMinutes * 60 * 1000);
  
            const roundedMinutes = Math.ceil(newTime.getMinutes() / 1);
            newTime.setMinutes(roundedMinutes);
  
            stop.adjustedTime = newTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
          }
  
          return stop;
        });
  
        setAdjustedStops(updatedStops);
      }
    }
  };
  

  const parseTime = (timeString) => {
    const [hours, minutes, meridian] = timeString.split(/[: ]/);
    const date = new Date();
    date.setHours(
      meridian === 'PM' && parseInt(hours) !== 12
        ? parseInt(hours) + 12
        : parseInt(hours)
    );
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    return date;
  };

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    setAdjustedStops(null);
    setTimeDifference(null);
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
  };

  const handleBackToStopList = () => {
    setSelectedStop(null);
    setShowBusHereButton(false);
  };

  const handleBackToBusList = () => {
    setSelectedBus(null);
    setSelectedStop(null);
    setShowBusHereButton(false);
    setAdjustedStops(null);
    setTimeDifference(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Bus Tracker</h1>
        <Clock />
      </header>
      <main className="App-content">
        <div className="content-wrapper">
          <section className="map-section">
            <h2>Live Map</h2>
            <DCUMap />
          </section>
          <section className="bus-list-section">
            <h2>
              {selectedStop
                ? `Stop Details: ${selectedStop.stop}`
                : selectedBus
                ? `Stops for ${selectedBus}`
                : 'Available Buses'}
            </h2>
            {!selectedBus ? (
              <>
                <div className="bus-item" onClick={() => handleBusClick('Bus1')}>Bus 1</div>
                <div className="bus-item" onClick={() => handleBusClick('Bus2')}>Bus 2</div>
                <div className="bus-item" onClick={() => handleBusClick('Bus3')}>Bus 3</div>
              </>
            ) : !selectedStop ? (
              <>
                <ul className="stop-list">
                  {(adjustedStops || busStops[selectedBus]).map((stop, index) => (
                    <li
                      key={index}
                      className="stop-item"
                      onClick={() => handleStopClick(stop)}
                    >
                      {stop.stop} - Scheduled: {stop.time}{' '}
                      {stop.adjustedTime && (
                        <span> (Adjusted: {stop.adjustedTime})</span>
                      )}
                    </li>
                  ))}
                </ul>
                <button className="button back-button" onClick={handleBackToBusList}>
                  Back to Bus List
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Stop:</strong> {selectedStop.stop}
                </p>
                <p>
                  <strong>Arrival Time:</strong> {selectedStop.time}
                </p>
                {selectedStop.adjustedTime && (
                  <p>
                    <strong>Adjusted Arrival Time:</strong> {selectedStop.adjustedTime}
                  </p>
                )}
                <button className="button" onClick={handlePopupOpen}>
                  Has your bus arrived?
                </button>
                {showBusHereButton && (
                  <button className="button bus-here-button" onClick={handleBusHereButton}>
                    My bus is here
                  </button>
                )}
                {lastActionTime && (
                  <>
                    <p className="time-log">Last action recorded at: {lastActionTime}</p>
                    {timeDifference && (
                      <p className="time-difference">Scheduled vs Actual: {timeDifference}</p>
                    )}
                  </>
                )}
                <button className="button back-button" onClick={handleBackToStopList}>
                  Back to Stop List
                </button>
              </>
            )}
          </section>
        </div>
      </main>
      {showPopup && (
        <Popup
          onClose={(answer) => handlePopupClose(answer)}
          onBusHere={handleBusHereButton}
        />
      )}
    </div>
  );
}

export default App;
