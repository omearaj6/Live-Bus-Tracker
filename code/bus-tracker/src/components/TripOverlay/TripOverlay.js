import React, { useState } from "react";
import { X } from "lucide-react";
import "./TripOverlay.css";

/* Trip Overlay shows trips connected to a stop, real-time updates, and user reports.
   Also allows users to submit new reports. */
const TripOverlay = ({ stopTimes, stopTimeUpdates, userReports, setShowTripOverlay }) => {
  const [selectedStopTime, setSelectedStopTime] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState("");

  /* Submit a user report */
  const handleSubmitReport = async () => {
    if (!reportDescription.trim()) {
      setReportDescription(null);
    }

    /* Get the current time and calculate the difference from the selected stop time */
    const now = new Date();
    const [arrivalHours, arrivalMinutes, arrivalSeconds] = selectedStopTime.arrival_time.split(":").map(Number);
    const arrivalTime = new Date();
    arrivalTime.setHours(arrivalHours, arrivalMinutes, arrivalSeconds, 0);

    const status = now > arrivalTime ? "delay" : "early"; // Determine if report is early or late
    const timeDifferenceMs = Math.abs(now - arrivalTime);
    let hoursDifference = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
    let minutesDifference = Math.floor((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60));
    let secondsDifference = Math.floor((timeDifferenceMs % (1000 * 60)) / 1000);

    try {
      const response = await fetch("https://live-bus-tracker.onrender.com/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trip_id: selectedStopTime.trip_id,
          stop_id: selectedStopTime.stop_id,
          stop_sequence: selectedStopTime.stop_sequence,
          status,
          delayHours: hoursDifference,
          delayMinutes: minutesDifference,
          delaySeconds: secondsDifference,
          description: reportDescription,
        }),
      });

      if (response.ok) {
        console.log("Report submitted successfully");
        setReportDescription("");
        setShowReportForm(false);
      } else {
        console.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  if (!stopTimes || stopTimes.length === 0) return null;

  /* Group reports by trip_id */
  const reportsByTripId = userReports.reduce((acc, report) => {
    if (!acc[report.trip_id]) {
      acc[report.trip_id] = [];
    }
    acc[report.trip_id].push(report);
    return acc;
  }, {});

  /* Find real-time updates for a trip_id */
  const getStopTimeUpdate = (trip_id) => {
    return stopTimeUpdates?.find(update => update.trip_id === trip_id);
  };

  return (
    <div className="trip-overlay">
      <button className="close-button" onClick={() => setShowTripOverlay(false)}>
        <X size={24} />
      </button>

      <div className="list-wrapper">
        <div className="list-container">
          {stopTimes.map((stopTime, index) => {
            const reports = reportsByTripId[stopTime.trip_id] || [];
            const realTimeUpdate = getStopTimeUpdate(stopTime.trip_id);

            let statusText = "On time";
            let statusColor = "green";

            if (realTimeUpdate) {
              const delaySeconds = realTimeUpdate.arrival_delay;
              if (delaySeconds > 0) {
                statusText = `Delayed by ${Math.floor(delaySeconds / 60)} min`;
                statusColor = "red";
              } else {
                statusText = "On time";
                statusColor = "green";
              }
            }

            return (
              <div
                key={index}
                className="list-item"
                onClick={() => setSelectedStopTime(stopTime)}
              >
                <div className="stop-time">{stopTime.arrival_time}</div>
                <div className={`latest-report visible`} style={{ color: statusColor }}>
                  {statusText}
                </div>
                {reports.length > 0 && (
                  <div className="user-reports">
                    Last report: {reports[0].status === "early" ? "Early" : "Late"} by {reports[0].delayMinutes} min
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedStopTime && (
        <div className="reports-panel">
          <h3>Reports for Trip {selectedStopTime.arrival_time}</h3>
          <ul>
            {reportsByTripId[selectedStopTime.trip_id]?.map((report, i) => {
              const [arrivalHours, arrivalMinutes, arrivalSeconds] = selectedStopTime.arrival_time.split(":").map(Number);
              const arrivalTime = new Date();
              arrivalTime.setHours(arrivalHours, arrivalMinutes, arrivalSeconds, 0);

              const expectedTime = new Date(arrivalTime);
              if (report.status === "early") {
                expectedTime.setMinutes(expectedTime.getMinutes() - report.delayMinutes);
              } else {
                expectedTime.setMinutes(expectedTime.getMinutes() + report.delayMinutes);
              }

              const expectedHours = String(expectedTime.getHours()).padStart(2, "0");
              const expectedMinutes = String(expectedTime.getMinutes()).padStart(2, "0");

              return (
                <li key={i} className="report-item">
                  <strong>Reported:</strong> {report.timestamp} <br />
                  <strong>Expected:</strong> {expectedHours}:{expectedMinutes} <br />
                  <strong>Status:</strong> {report.status === "early" ? "Early" : "Late"} by {report.delayMinutes} min
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedStopTime && !showReportForm && (
        <button className="floating-report-btn" onClick={() => setShowReportForm(true)}>
          Has the bus arrived?
        </button>
      )}

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
