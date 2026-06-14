import React, { useState } from 'react';
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import API from '../api/api';

const Reports = () => {
  const [downloading, setDownloading] = useState({ employees: false, leaves: false, assets: false });
  const [error, setError] = useState('');

  const handleDownload = async (endpoint, filename, key) => {
    setDownloading(prev => ({ ...prev, [key]: true }));
    setError('');

    try {
      const res = await API.get(endpoint, { responseType: 'blob' });
      
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(`Failed to export report: ${err.message || 'Server error'}`);
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div>
          <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Download official data exports and tabular summaries.</p>
        </div>
      </div>

      {error && (
        <div className="badge-rejected" style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2-col" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Card 1: Employees */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--accent-cyan)' }} />
              <h3 style={{ fontSize: '20px' }}>Employees Directory</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Export the entire registry of employee profiles, including names, designations, departments, salary details, and contact numbers.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '10px' }}
            onClick={() => handleDownload('/reports/export/employees', 'employees_report.csv', 'employees')}
            disabled={downloading.employees}
          >
            {downloading.employees ? (
              <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#000' }}></div>
            ) : (
              <>
                <Download size={18} />
                <span>Export Employees Directory</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Leaves */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--accent-violet)' }} />
              <h3 style={{ fontSize: '20px' }}>Leave Applications History</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Export all submitted leave requests, dates, total days, approvals status, and approval remarks from the system workflow history.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '10px' }}
            onClick={() => handleDownload('/reports/export/leaves', 'leaves_report.csv', 'leaves')}
            disabled={downloading.leaves}
          >
            {downloading.leaves ? (
              <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#000' }}></div>
            ) : (
              <>
                <Download size={18} />
                <span>Export Leaves History</span>
              </>
            )}
          </button>
        </div>

        {/* Card 3: Assets */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'space-between', minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--accent-amber)' }} />
              <h3 style={{ fontSize: '20px' }}>Hardware Asset Catalog</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Export the system's hardware inventory, purchase costs, statuses, and current employee allocations records.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '10px' }}
            onClick={() => handleDownload('/reports/export/assets', 'assets_report.csv', 'assets')}
            disabled={downloading.assets}
          >
            {downloading.assets ? (
              <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#000' }}></div>
            ) : (
              <>
                <Download size={18} />
                <span>Export Asset Inventory</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
