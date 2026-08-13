import React, { useState, useEffect } from 'react';
import { X, User, Key, Mail, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { updateUserProfile, changePassword } from '../services/api';

export default function ProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'password'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || currentUser.username || '');
      setEmail(currentUser.email || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    setLoading(true);

    try {
      const updated = await updateUserProfile({ name, email, bio, avatarUrl });
      setLoading(false);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
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
      <div className="modal-container" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '8px', color: 'var(--primary-glow)' }}>
              <User size={20} />
            </div>
            <div>
              <h2 className="modal-title">Account & Profile Settings</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Manage your personal details and security preferences
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1rem 1.5rem 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'general' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.88rem' }}
            onClick={() => { setActiveTab('general'); setStatusMsg({ type: '', text: '' }); }}
          >
            <User size={15} style={{ marginRight: '0.4rem' }} /> Profile Details
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.88rem' }}
            onClick={() => { setActiveTab('password'); setStatusMsg({ type: '', text: '' }); }}
          >
            <Key size={15} style={{ marginRight: '0.4rem' }} /> Security & Password
          </button>
        </div>

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
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Deepanshi Kaushal"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@vortiq.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Headline</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Lead System Architect & Workspace Owner"
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '1.25rem', padding: 0, border: 'none' }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={15} style={{ marginRight: '0.4rem' }} /> Save Changes
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
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>

              <div className="modal-footer" style={{ marginTop: '1.25rem', padding: 0, border: 'none' }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Key size={15} style={{ marginRight: '0.4rem' }} /> Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
