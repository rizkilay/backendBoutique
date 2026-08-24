import React, { useState } from "react";
import "./financeApp.css";

const FinanceAppPage = () => {
  const [downloaded, setDownloaded] = useState(false);

  return (
    <div className="finance-download-only-container">
      <div className="finance-download-card">
        <div className="finance-icon-circle">
          <i className="fa-brands fa-windows"></i>
        </div>
        
        <h2>Finance App</h2>
        <p className="subtitle">Application Windows</p>

        <a
          href="/FinanceSetup.exe"
          download="FinanceSetup.exe"
          onClick={() => setDownloaded(true)}
          className="btn-simple-download"
        >
          <i className="fa-solid fa-download"></i>
          <span>Télécharger pour Windows (.exe)</span>
        </a>

        {downloaded && (
          <p className="download-success-msg">
            <i className="fa-solid fa-circle-check"></i> Téléchargement démarré...
          </p>
        )}
      </div>
    </div>
  );
};

export default FinanceAppPage;
