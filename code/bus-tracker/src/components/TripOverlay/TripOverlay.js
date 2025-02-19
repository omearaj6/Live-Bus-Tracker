import React, { useState } from "react";
import { X } from "lucide-react";
import "./TripOverlay.css";

const TripOverlay = ({ stopTimes, userReports, setShowTripOverlay }) => {
  const [selectedStopTime, setSelectedStopTime] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  const handleSubmitReport = async () => {
    if (!reportDescription.trim()) {
      setReportDescription(null);
    }
    // does not account for past midnight
    const now = new Date();
    const [arrivalHours, arrivalMinutes, arrivalSeconds] = selectedStopTime.arrival_time.split(":").map(Number);
    const arrivalTime = new Date();
    arrivalTime.setHours(arrivalHours, arrivalMinutes, arrivalSeconds, 0);

    const status = arrivalTime > now ? "early" : "delay";
    const timeDifferenceMs = Math.abs(now - arrivalTime);

    let hoursDifference = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
    let minutesDifference = Math.floor((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60));
    let secondsDifference = Math.floor((timeDifferenceMs % (1000 * 60)) / 1000);
    
    try {
      const response = await fetch("http://localhost:5000/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trip_id: selectedStopTime.trip_id,
          stop_id: selectedStopTime.stop_id,
          stop_sequence: selectedStopTime.stop_sequence,
          status: status,
          delayHours: hoursDifference,
          delayMinutes: minutesDifference,
          delaySeconds: secondsDifference,
          description: reportDescription,
        }),
      });
  
      if (response.ok) {
        console.log("Report submitted successfully");
        setReportDescription(""); // Clear input
        setShowReportForm(false); // Hide form
      } else {
        console.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  if (!stopTimes || stopTimes.length === 0) return null;

  // Group reports by trip_id
  const reportsByTripId = userReports.reduce((acc, report) => {
    if (!acc[report.trip_id]) {
      acc[report.trip_id] = [];
    }
    acc[report.trip_id].push(report);
    return acc;
  }, {});

  return (
    <div className="trip-overlay">
      {/* Close Button */}
      <button className="close-button" onClick={() => setShowTripOverlay(false)}>
        <X size={24} />
      </button>

      {/* Left Side: Stop Times List */}
      <div className="list-wrapper">
        <div className="list-container">
          {stopTimes.map((stopTime, index) => {
            const reports = reportsByTripId[stopTime.trip_id] || [];
            if (reports.length > 0) {
              let latestReport = reports[0];
              let status = latestReport.status === "early" ? "Early by" : "Late by";
              return (
                <div 
                  key={index} 
                  className="list-item" 
                  onClick={() => setSelectedStopTime(stopTime)}
                >
                  <div className="stop-time">{stopTime.arrival_time}</div>
                  <div className={`latest-report visible`}>
                    Last Report: {status} {latestReport.delayHours} hours,&nbsp;
                    {latestReport.delayMinutes} minutes,&nbsp;
                    {latestReport.delaySeconds} seconds.
                  </div>
                </div>
              );
            } else {
              return (
                <div 
                  key={index} 
                  className="list-item" 
                  onClick={() => setSelectedStopTime(stopTime)}
                >
                  <div className="stop-time">{stopTime.arrival_time}</div>
                  <div className={`latest-report`}>
                    No reports available
                  </div>
                </div>
              );
            }
            
          })}
        </div>
      </div>

      {/* Right Side: Full Report List (Only if a stop time is clicked) */}
      {selectedStopTime && (
        <div className="reports-panel">
          <h3>Reports for Trip {selectedStopTime.arrival_time}</h3>
          <ul>
            {reportsByTripId[selectedStopTime.trip_id]?.map((report, i) => {
              let timeStatus = "Late by";
              const [arrivalHours, arrivalMinutes, arrivalSeconds] = selectedStopTime.arrival_time.split(":").map(Number);
              const arrivalTime = new Date();
              arrivalTime.setHours(arrivalHours, arrivalMinutes, arrivalSeconds, 0);
              
              const expectedTime = new Date(arrivalTime);
              if (report.status === "early") {
                timeStatus = "Early by";
                expectedTime.setHours(expectedTime.getHours() - report.delayHours);
                expectedTime.setMinutes(expectedTime.getMinutes() - report.delayMinutes);
                expectedTime.setSeconds(expectedTime.getSeconds() - report.delaySeconds);
              } else {
                expectedTime.setHours(expectedTime.getHours() + report.delayHours);
                expectedTime.setMinutes(expectedTime.getMinutes() + report.delayMinutes);
                expectedTime.setSeconds(expectedTime.getSeconds() + report.delaySeconds);
              }
              const expectedHours = String(expectedTime.getHours()).padStart(2, "0");
              const expectedMinutes = String(expectedTime.getMinutes()).padStart(2, "0");
              const expectedSeconds = String(expectedTime.getSeconds()).padStart(2, "0");
              let stopStatus = selectedStopTime.stop_sequence > report.stop_sequence ? "behind" : "ahead";
              let stops = Math.abs(selectedStopTime.stop_sequence - report.stop_sequence);
              return (
                <li key={i} className="report-item">
                  Reported {report.timestamp} <br/><br/>
                  Expected: {expectedHours}:{expectedMinutes}:{expectedSeconds} <br/>
                  {timeStatus} {report.delayHours} hours,&nbsp;
                  {report.delayMinutes} minutes,&nbsp;
                  {report.delaySeconds} seconds. <br/>
                  {stops} stops {stopStatus}.
                </li>
              )
          })}
          </ul>
        </div>
      )}

      {/* Floating Submit Report Button */}
      {selectedStopTime && !showReportForm && (
        <button 
          className="floating-report-btn" 
          onClick={() => setShowReportForm(true)}
        >
          Has the bus arrived?
        </button>
      )}

      {/* Fullscreen Report Form Overlay */}
      {showReportForm && (
        <div className="report-form-overlay">
          <textarea
            placeholder="Optional: Describe the delay"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="report-input"
          />
          <button className="send-report-btn" onClick={handleSubmitReport}>
            Send Report
          </button>
          <button className="cancel-report-btn" onClick={() => setShowReportForm(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TripOverlay;
