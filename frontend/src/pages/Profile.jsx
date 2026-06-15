import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Briefcase, DollarSign, Upload, FileText, Check } from 'lucide-react';
import API, { BASE_ASSET_URL } from '../api/api';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [fullDetails, setFullDetails] = useState(null);
  const [skillsMaster, setSkillsMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [fileType, setFileType] = useState('profile_photo');
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchProfileDetails = async () => {
    try {
      const summaryRes = await API.get('/auth/profile');
      const empId = summaryRes.data.data.employee_id;
      setProfile(summaryRes.data.data);

      const [detailsRes, skillsRes] = await Promise.all([
        API.get(`/employees/${empId}`),
        API.get('/employees/skills')
      ]);

      const details = detailsRes.data.data;
      setFullDetails(details);
      setSkillsMaster(skillsRes.data.data);

      setPhone(details.phone || '');
      setAddress(details.address || '');
      setSelectedSkills(details.employee_skills.map(s => s.skill_id));
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      await API.put(`/employees/${fullDetails.id}`, {
        phone,
        address,
        skills: selectedSkills
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      fetchProfileDetails();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId) 
        : [...prev, skillId]
    );
  };

  const handleFileChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (uploadFiles.length === 0) return;

    setUploading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    uploadFiles.forEach(file => {
      formData.append(fileType, file);
    });

    try {
      await API.post(`/employees/${fullDetails.id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage({ text: 'Documents uploaded and attached successfully!', type: 'success' });
      setUploadFiles([]);
      fetchProfileDetails();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to upload files.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  const profilePhoto = fullDetails?.employee_images?.find(img => img.file_type === 'profile_photo');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>My Enterprise Profile</h1>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'badge-approved' : 'badge-rejected'} style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', width: 'fit-content' }}>
          {message.text}
        </div>
      )}

      <div className="grid-2-col" style={{ gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Side Profile Card */}
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
          <div className="profile-photo-container" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)' }}>
            {profilePhoto ? (
              <img src={`${BASE_ASSET_URL}${profilePhoto.image_url}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', fontSize: '48px', color: 'var(--text-secondary)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 style={{ fontSize: '22px', marginBottom: '4px' }}>{profile?.name}</h2>
          <span className={`badge badge-${user?.role}`} style={{ marginBottom: '16px' }}>{profile?.role}</span>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <Mail size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{profile?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <Briefcase size={16} style={{ color: 'var(--accent-violet)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{profile?.designation} ({profile?.department_name || 'No Department'})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
              <DollarSign size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Salary: ${parseFloat(profile?.salary || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side Settings & Uploads Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile Edit Panel */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Edit Details</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-123-4567" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Corporate St, City" 
                  />
                </div>
              </div>

              {/* Skills checklist */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Skills & Expertises</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {skillsMaster.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button 
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--glass-border)',
                          background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {isSelected && <Check size={14} />}
                        <span>{skill.skill_name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }} disabled={updating}>
                {updating ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* Document Uploads Panel */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Documents & Files</h3>
            
            <form onSubmit={handleUploadFiles} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end', marginBottom: '32px' }}>
              <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
                <label className="form-label">File Category</label>
                <select className="form-input" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                  <option value="profile_photo">Profile Photo</option>
                  <option value="aadhar_card">National ID / Aadhar Card</option>
                  <option value="resume">Resume / CV</option>
                  <option value="certificate">Degree Certificate</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: '2', minWidth: '250px', marginBottom: 0 }}>
                <label className="form-label">Select Files</label>
                <div style={{ position: 'relative' }}>
                  <input type="file" className="form-input" multiple onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }} required />
                  <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
                    <Upload size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {uploadFiles.length > 0 ? `${uploadFiles.length} file(s) selected` : 'Choose files (PDF, JPG, PNG)...'}
                    </span>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ height: '48px' }} disabled={uploading || uploadFiles.length === 0}>
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </form>

            {/* Uploaded Documents List */}
            <h4 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Uploaded Documents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {fullDetails?.employee_images?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No documents uploaded yet.</p>
              ) : (
                fullDetails?.employee_images?.map((doc) => (
                  <div key={doc.id} className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <FileText size={20} style={{ color: 'var(--accent-violet)' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{doc.file_type.replace('_', ' ').toUpperCase()}</div>
                        <a href={`${BASE_ASSET_URL}${doc.image_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'none' }}>View Document</a>
                      </div>
                    </div>
                    <span className="badge badge-approved" style={{ fontSize: '11px' }}>Attached</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
