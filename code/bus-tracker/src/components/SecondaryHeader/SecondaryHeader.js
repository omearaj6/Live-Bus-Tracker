import { useState } from "react";
import "./SecondaryHeader.css";

const SecondaryHeader = () => {
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);

  const handleTopSelect = (option) => {
    setSelectedTop(selectedTop === option ? null : option); // Toggle selection
    setSelectedBottom(null); // Reset bottom row when switching top row
  };

  const handleBottomSelect = (option) => {
    setSelectedBottom(selectedBottom === option ? null : option); // Toggle selection
  };

  return (
    <div className="secondaryHeader">
      {/* Top Row */}
      <div className="topRow">
        <button
          className={`headerButton ${selectedTop === "N4" ? "selected" : ""}`}
          onClick={() => handleTopSelect("N4")}
        >
          N4
        </button>
      </div>

      {/* Bottom Row (Always Present but Hidden Until Selected) */}
      <div className={`bottomRow ${selectedTop ? "visible" : ""}`}>
        <button
          className={`headerButton ${selectedBottom === "Blanchardstown" ? "selected" : ""}`}
          onClick={() => handleBottomSelect("Blanchardstown")}
        >
          Blanchardstown
        </button>
        <button
          className={`headerButton ${selectedBottom === "Point Village" ? "selected" : ""}`}
          onClick={() => handleBottomSelect("Point Village")}
        >
          Point Village
        </button>
      </div>
    </div>
  );
};

export default SecondaryHeader;
