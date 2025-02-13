import React from 'react';
import './ReportBox.css';

const ReportBox = ({ reportedBusStatus }) => {
  return (
    reportedBusStatus.length > 0 && (
      <div className="reported-status-box">
        <h3>Live User Reports</h3>
        <ul>
          {reportedBusStatus.map((report, index) => (
            <li key={index}>
              A user has reported that <strong>{report.bus}</strong> is{' '}
              <strong>{report.status}</strong>.
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default ReportBox;
