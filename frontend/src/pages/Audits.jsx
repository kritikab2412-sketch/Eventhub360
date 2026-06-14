import React, { useEffect, useState } from 'react';
import { ShieldCheck, Eye, EyeOff, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import API from '../api/api';

const Audits = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/reports/audit-logs?page=${page}&limit=10`);
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  const toggleExpandLog = (id) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  if (loading && logs.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div>
          <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>System Mutation Audit Logs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View database level insert, update, and delete triggers logs.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>No database audit logs available.</p>
        ) : (
          <>
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Table Affected</th>
                    <th>Action</th>
                    <th>Record ID</th>
                    <th>Performed By</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td><code>{log.table_name}</code></td>
                          <td>
                            <span className={`badge ${
                              log.action_type === 'INSERT' ? 'badge-approved' : 
                              log.action_type === 'UPDATE' ? 'badge-pending' : 'badge-rejected'
                            }`}>
                              {log.action_type}
                            </span>
                          </td>
                          <td>{log.record_id}</td>
                          <td>User ID: {log.performed_by || 'System Trigger'}</td>
                          <td>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => toggleExpandLog(log.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <EyeOff size={14} />
                                  <span>Hide Data</span>
                                  <ChevronUp size={14} />
                                </>
                              ) : (
                                <>
                                  <Eye size={14} />
                                  <span>View Data</span>
                                  <ChevronDown size={14} />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="6" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '24px' }}>
                              <div className="grid-2-col" style={{ gap: '24px' }}>
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>OLD VALUES</div>
                                  <pre style={{ 
                                    background: 'rgba(0,0,0,0.4)', 
                                    padding: '16px', 
                                    borderRadius: '8px', 
                                    overflowX: 'auto',
                                    fontSize: '12px', 
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--accent-rose)',
                                    border: '1px solid var(--glass-border)',
                                    maxHeight: '300px'
                                  }}>
                                    {log.old_data ? JSON.stringify(log.old_data, null, 2) : 'NULL (Record Inserted)'}
                                  </pre>
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>NEW VALUES</div>
                                  <pre style={{ 
                                    background: 'rgba(0,0,0,0.4)', 
                                    padding: '16px', 
                                    borderRadius: '8px', 
                                    overflowX: 'auto',
                                    fontSize: '12px', 
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--accent-emerald)',
                                    border: '1px solid var(--glass-border)',
                                    maxHeight: '300px'
                                  }}>
                                    {log.new_data ? JSON.stringify(log.new_data, null, 2) : 'NULL (Record Deleted)'}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1}>
                <span>Prev</span>
              </button>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary" onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
                <span>Next</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Audits;
