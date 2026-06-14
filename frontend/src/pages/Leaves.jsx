import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, AlertTriangle, ArrowRight, X, FileText, CheckCircle } from 'lucide-react';
import API from '../api/api';

const Leaves = () => {
  const { user } = useSelector((state) => state.auth);
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Apply Leave Form state
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchLeaveData = async () => {
    try {
      const typesRes = await API.get('/leaves/types');
      setLeaveTypes(typesRes.data.data);

      if (user?.role === 'employee') {
        const [balancesRes, requestsRes] = await Promise.all([
          API.get('/leaves/balances'),
          API.get('/leaves/requests')
        ]);
        setBalances(balancesRes.data.data);
        setRequests(requestsRes.data.data);
      } else {
        // Managers, HR, Admins see the requests queue
        const requestsRes = await API.get('/leaves/requests');
        setRequests(requestsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load leave data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [user]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.post('/leaves/apply', {
        leave_type_id: parseInt(leaveTypeId),
        from_date: fromDate,
        to_date: toDate,
        reason
      });
      setMessage({ text: 'Leave application submitted successfully!', type: 'success' });
      setFromDate('');
      setToDate('');
      setReason('');
      setLeaveTypeId('');
      fetchLeaveData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit application.', type: 'error' });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleOpenReview = (req) => {
    setSelectedReq(req);
    setReviewRemarks('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (status) => {
    setReviewLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await API.put(`/leaves/review/${selectedReq.id}`, {
        status,
        remarks: reviewRemarks
      });
      setMessage({ text: `Leave application status updated to ${status}.`, type: 'success' });
      setShowReviewModal(false);
      fetchLeaveData();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit review.', type: 'error' });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
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
          <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>Leave Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Apply for leave or manage pending workflow approvals.</p>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'badge-approved' : 'badge-rejected'} style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', width: 'fit-content' }}>
          {message.text}
        </div>
      )}

      {user?.role === 'employee' ? (
        /* Employee Dashboard view */
        <div className="grid-2-col" style={{ gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Side: Balances & New application */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Balances Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>My Leave Balances</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {balances.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No leave balances initialized.</p>
                ) : (
                  balances.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignContent: 'center', justifyItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontWeight: '500' }}>{b.leave_types.leave_name}</span>
                      <strong className="glow-text" style={{ color: 'var(--accent-cyan)' }}>{b.available_days} Days Left</strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Apply Leave Form Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>Apply For Leave</h3>
              <form onSubmit={handleApplyLeave}>
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-input" value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} required>
                    <option value="">Select leave type</option>
                    {leaveTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.leave_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2-col">
                  <div className="form-group">
                    <label className="form-label">From Date</label>
                    <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Date</label>
                    <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Explanation</label>
                  <textarea className="form-input" rows="3" placeholder="Provide details regarding your request..." value={reason} onChange={(e) => setReason(e.target.value)} required style={{ resize: 'none' }}></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : 'Apply Now'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Requests History */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>My Applications History</h3>
            {requests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No leave requests submitted yet.</p>
            ) : (
              <div className="table-container" style={{ margin: 0 }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Dates Range</th>
                      <th>Total Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td><strong>{req.leave_types.leave_name}</strong></td>
                        <td>{new Date(req.from_date).toLocaleDateString()} to {new Date(req.to_date).toLocaleDateString()}</td>
                        <td>{req.total_days} Days</td>
                        <td>
                          <span className={`badge badge-${req.status.toLowerCase().replace(/ /g, '-')}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Manager / HR / Admin Workflow queue view */
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '20px' }}>Approvals Request Queue</h3>
          {requests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No leave requests found in the queue.</p>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Dates Range</th>
                    <th>Total Days</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{req.employee_profiles?.users.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{req.employee_profiles?.departments?.department_name || 'No Dept'}</div>
                      </td>
                      <td><strong>{req.leave_types?.leave_name}</strong></td>
                      <td>{new Date(req.from_date).toLocaleDateString()} to {new Date(req.to_date).toLocaleDateString()}</td>
                      <td>{req.total_days} Days</td>
                      <td>
                        <span className={`badge badge-${req.status.toLowerCase().replace(/ /g, '-')}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {/* Only allow reviewing if status warrants the current user's role */}
                        {((req.status === 'Pending' && ['manager', 'admin'].includes(user?.role)) || 
                          (req.status === 'Approved by Manager' && ['hr', 'admin'].includes(user?.role))) ? (
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => handleOpenReview(req)}>
                            Review Request
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Request Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="glow-text">Review Leave Request</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Employee:</strong> {selectedReq?.employee_profiles?.users.name}</div>
              <div><strong>Leave Type:</strong> {selectedReq?.leave_types?.leave_name}</div>
              <div><strong>Date Range:</strong> {new Date(selectedReq?.from_date).toLocaleDateString()} to {new Date(selectedReq?.to_date).toLocaleDateString()} ({selectedReq?.total_days} Days)</div>
              <div><strong>Reason:</strong> "{selectedReq?.reason}"</div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Remarks / Reason for decision</label>
              <textarea className="form-input" rows="3" placeholder="Enter remarks..." value={reviewRemarks} onChange={(e) => setReviewRemarks(e.target.value)} style={{ resize: 'none' }}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowReviewModal(false)} disabled={reviewLoading}>Cancel</button>
              
              <button 
                className="btn btn-secondary" 
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.1)' }} 
                onClick={() => handleReviewSubmit('Rejected')} 
                disabled={reviewLoading}
              >
                Reject Request
              </button>

              {user?.role === 'manager' && (
                <button className="btn btn-primary" onClick={() => handleReviewSubmit('Approved by Manager')} disabled={reviewLoading}>
                  Approve (Dept)
                </button>
              )}

              {['hr', 'admin'].includes(user?.role) && (
                <button className="btn btn-primary" onClick={() => handleReviewSubmit('Approved')} disabled={reviewLoading}>
                  Final Approval
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
