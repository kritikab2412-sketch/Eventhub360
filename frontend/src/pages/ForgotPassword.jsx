import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { Mail, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container animate-fade-in">
        <div className="auth-card glass-panel" style={{ padding: '48px 40px' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--accent-emerald)', marginBottom: '24px' }} />
          <h2 className="glow-text" style={{ fontSize: '28px', marginBottom: '16px' }}>Request Sent</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
            We've sent a password reset link to <strong style={{ color: '#fff' }}>{email}</strong>. 
            The link will remain active for 15 minutes.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel">
        <h2 className="glow-text" style={{ fontSize: '32px', marginBottom: '8px' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Enter your email to receive a password reset link</p>

        {error && (
          <div className="badge-rejected" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'left', lineHeight: '1.4' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '48px' }}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '48px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#000' }}></div> : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} />
            <span>Return to Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
