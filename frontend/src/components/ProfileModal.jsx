import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Key,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Save,
  Building,
  Phone,
  Camera,
  Upload,
  Sparkles,
  Trash2
} from 'lucide-react';
import { updateUserProfile, changePassword } from '../services/api';
import { compressImageFile } from '../utils/imageUtils';

const DEPARTMENTS = [
  'Engineering & Development',
  'Product & Strategy',
  'UI/UX & Design',
  'Cloud Infrastructure & DevOps',
  'QA & Test Automation',
  'Cybersecurity & Compliance',
  'Data Science & Analytics',
  'Operations & Management'
];

const AVATAR_PRESETS = [
  { id: 1, name: 'Deepanshi', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80' },
  { id: 2, name: 'Sarah', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Marcus', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80' },
  { id: 4, name: 'Alex', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80' },
  { id: 5, name: 'David', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&auto=format&fit=crop&q=80' },
  { id: 6, name: 'Elena', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140&auto=format&fit=crop&q=80' }
];

export default function ProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'password'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering & Development');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);

  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.username || '');
      setEmail(currentUser.email || '');
      setDepartment(currentUser.department || 'Engineering & Development');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || AVATAR_PRESETS[0].url);
      setIsCustomUploaded(currentUser.avatarUrl && currentUser.avatarUrl.startsWith('data:'));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setStatusMsg({ type: '', text: '' });
      const compressedDataUrl = await compressImageFile(file, 280, 280, 0.85);
      setAvatarUrl(compressedDataUrl);
      setIsCustomUploaded(true);
      setStatusMsg({ type: 'success', text: 'Photo loaded from gallery! Click Save to apply.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to process image file' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const updated = await updateUserProfile({
        name,
        email,
        department,
        phone,
        bio,
        avatarUrl
      });
      setLoading(false);
      setStatusMsg({ type: 'success', text: 'Profile details saved successfully!' });
      onProfileUpdated(updated);
    } catch (err) {
      setLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setLoading(false);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to change password' });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(225, 29, 72, 0.2)', borderRadius: '8px', color: '#ff859b' }}>
              <User size={20} />
            </div>
            <div>
              <h2 className="modal-title">Account & Profile Settings</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Manage your official details, team role, avatar photo, and security
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ padding: '0.85rem 1.5rem 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'general' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            onClick={() => { setActiveTab('general'); setStatusMsg({ type: '', text: '' }); }}
          >
            <User size={15} style={{ marginRight: '0.4rem' }} /> Profile Details
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            onClick={() => { setActiveTab('password'); setStatusMsg({ type: '', text: '' }); }}
          >
            <Key size={15} style={{ marginRight: '0.4rem' }} /> Security & Password
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          
          {statusMsg.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {activeTab === 'general' ? (
            <form onSubmit={handleProfileSubmit} className="modal-form">
              
              {/* Profile Avatar Upload & Selector */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Profile Picture / Photo</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary-glow)', fontWeight: 700 }}>
                    {isCustomUploaded ? 'Custom Photo Loaded ✓' : 'Upload from Device or Select Preset'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <img
                    src={avatarUrl || AVATAR_PRESETS[0].url}
                    alt="Profile Avatar"
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e11d48', boxShadow: '0 0 16px rgba(225, 29, 72, 0.4)' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.785rem', gap: '0.35rem' }}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        <Upload size={14} />
                        <span>Upload from Gallery / Storage</span>
                      </button>

                      {isCustomUploaded && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            setAvatarUrl(AVATAR_PRESETS[0].url);
                            setIsCustomUploaded(false);
                          }}
                        >
                          <Trash2 size={13} /> Reset
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
                      Choose any photo from your phone gallery or computer storage
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '0.45rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Or select an avatar preset:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {AVATAR_PRESETS.map((preset) => (
                      <img
                        key={preset.id}
                        src={preset.url}
                        alt={preset.name}
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          setIsCustomUploaded(false);
                        }}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: avatarUrl === preset.url ? '2px solid #e11d48' : '1px solid var(--border-color)',
                          transform: avatarUrl === preset.url ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.2s'
                        }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                <input
                  type="url"
                  className="form-input"
                  placeholder="Or paste external image URL..."
                  value={isCustomUploaded ? '' : avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setIsCustomUploaded(false);
                  }}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                />
              </div>

              {/* Name & Official Email */}
              <div className="grid-responsive">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ paddingLeft: '2.4rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Official Email ID</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: '2.4rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Department & Phone */}
              <div className="grid-responsive">
                <div className="form-group">
                  <label className="form-label">Department / Role</label>
                  <select
                    className="form-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ paddingLeft: '2.4rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="form-group">
                <label className="form-label">Professional Bio / Status</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Lead Full-Stack Architect & AI System Specialist..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '0.4rem' }}>
                  <Save size={15} />
                  <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (min 6 characters)</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: '0.4rem' }}>
                  <Key size={15} />
                  <span>{loading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
