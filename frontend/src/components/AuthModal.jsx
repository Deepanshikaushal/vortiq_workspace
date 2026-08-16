import React, { useState, useRef } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  LogIn,
  UserPlus,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Building,
  Phone,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2
} from 'lucide-react';
import { login, register, sendSignUpOTP, verifySignUpOTP } from '../services/api';
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

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [step, setStep] = useState(1); // 1: Details, 2: OTP verification
  
  // Registration & Profile Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('Engineering & Development');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);

  const fileInputRef = useRef(null);

  const [otpCode, setOtpCode] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setError('');
    setDemoOtpNotice('');
    setOtpCode('');
    setStep(1);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      const compressedDataUrl = await compressImageFile(file, 280, 280, 0.85);
      setAvatarUrl(compressedDataUrl);
      setIsCustomUploaded(true);
    } catch (err) {
      setError(err.message || 'Failed to process image file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in your official email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await sendSignUpOTP(email);
      setLoading(false);
      setDemoOtpNotice(`Verification Code Sent! Demo OTP: ${res.otp} (or use 123456)`);
      setStep(2);
    } catch (err) {
      setLoading(false);
      setError('Failed to send OTP verification code');
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifySignUpOTP(email, otpCode.trim());
      if (!isValid) {
        setLoading(false);
        setError('Invalid OTP verification code. Try again or click Resend Code.');
        return;
      }

      const payload = {
        username: username.trim() || email.split('@')[0],
        name: name.trim() || username.trim() || email.split('@')[0],
        email: email.trim().toLowerCase(),
        password,
        department,
        phone: phone.trim(),
        bio: bio.trim() || `${department} team member`,
        avatarUrl
      };

      const data = await register(payload);
      setLoading(false);
      onAuthSuccess(data.user);
      onClose();
      handleReset();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      setLoading(false);
      onAuthSuccess(data.user);
      onClose();
      handleReset();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: mode === 'register' && step === 1 ? '580px' : '460px', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(225, 29, 72, 0.2)', borderRadius: '8px', color: '#ff859b' }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 className="modal-title">
                {mode === 'login' ? 'Welcome to VortiQ' : step === 1 ? 'Create Official Account' : 'Verify Email Address'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {mode === 'login' ? 'Access your workspace dashboard & team tasks' : step === 1 ? 'Register with your official details, photo & department' : `Enter verification code sent to ${email}`}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (Login / Register) */}
        <div style={{ padding: '0.85rem 1.5rem 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            onClick={() => { setMode('login'); handleReset(); }}
          >
            <LogIn size={14} style={{ marginRight: '0.35rem' }} /> Sign In
          </button>
          <button
            type="button"
            className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            onClick={() => { setMode('register'); handleReset(); }}
          >
            <UserPlus size={14} style={{ marginRight: '0.35rem' }} /> New Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {demoOtpNotice && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{demoOtpNotice}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Official Email ID</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="deepanshi@vortiq.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Demo: any password or registered credentials
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>
          ) : step === 1 ? (
            
            /* MODE 2 - STEP 1: REGISTRATION DETAILS FORM */
            <form onSubmit={handleSendOTP} className="modal-form">
              
              {/* Profile Picture Upload & Selector */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Profile Picture / Photo</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary-glow)', fontWeight: 700 }}>
                    {isCustomUploaded ? 'Custom Photo Uploaded ✓' : 'Presets & Gallery Upload'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <img
                    src={avatarUrl || AVATAR_PRESETS[0].url}
                    alt="Selected Avatar"
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e11d48', boxShadow: '0 0 16px rgba(225, 29, 72, 0.4)' }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      
                      {/* Hidden File Input for Device Gallery / Storage */}
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
                      PNG, JPG, WebP, GIF from mobile gallery or PC storage (auto-optimized)
                    </p>
                  </div>
                </div>

                {/* Preset Avatar Gallery Selection */}
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
                          width: '38px',
                          height: '38px',
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

                <div>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Or paste external image URL..."
                    value={isCustomUploaded ? '' : avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setIsCustomUploaded(false);
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  />
                </div>
              </div>

              {/* Full Name & Username */}
              <div className="grid-responsive">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Deepanshi Kaushal"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!username) setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                      }}
                      style={{ paddingLeft: '2.4rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="deepanshi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Official Email ID */}
              <div className="form-group">
                <label className="form-label">Official Email ID *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="deepanshi@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
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
                  <label className="form-label">Phone Number</label>
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

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Create Password * (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Sending Verification Code...' : 'Proceed to Email Verification →'}
              </button>
            </form>
          ) : (
            
            /* MODE 2 - STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyAndRegister} className="modal-form">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ff859b', marginBottom: '0.75rem' }}>
                  <KeyRound size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Enter Verification Code</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                  We sent a 6-digit verification code to <strong>{email}</strong>
                </p>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  className="form-input"
                  placeholder="1 2 3 4 5 6"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.35em', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Verify & Launch Account'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
