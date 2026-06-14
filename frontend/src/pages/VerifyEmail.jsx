import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/api';
import { CheckCircle2, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      try {
        const res = await API.get(`/auth/verify-email/${token}`);
        setSuccess(true);
        setMessage(res.data.message);
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'The verification link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      performVerification();
    }
  }, [token]);

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-panel" style={{ padding: '48px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
            <h3 style={{ color: 'var(--text-secondary)' }}>Verifying Account...</h3>
          </div>
        ) : success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CheckCircle2 size={64} style={{ color: 'var(--accent-emerald)', marginBottom: '24px' }} />
            <h2 className="glow-text" style={{ fontSize: '28px', marginBottom: '16px' }}>Account Activated</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
              {message || 'Your email address has been successfully verified! You can now access the portal.'}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              <span>Proceed to Login</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <XCircle size={64} style={{ color: 'var(--accent-rose)', marginBottom: '24px' }} />
            <h2 className="glow-text" style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--accent-rose)' }}>Activation Failed</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
              {message}
            </p>
            <Link to="/signup" className="btn btn-primary" style={{ width: '100%' }}>
              <span>Request New Activation</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
