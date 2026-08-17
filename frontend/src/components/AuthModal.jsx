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
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Check
} from 'lucide-react';
import {
  login,
  register,
  sendSignUpOTP,
  verifySignUpOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithOTP
} from '../services/api';
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
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
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

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  // Forgot Password Specific States
  const [forgotChannel, setForgotChannel] = useState('EMAIL'); // 'EMAIL' | 'PHONE'
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Request OTP, 2: Verify & Reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setError('');
    setDemoOtpNotice('');
    setOtpCode('');
    setGeneratedOtp('');
    setStep(1);
    setForgotStep(1);
    setNewPassword('');
    setConfirmPassword('');
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

  // Sign Up OTP Send
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
      setGeneratedOtp(res.otp);
      setOtpCode(res.otp); // Pre-fill automatically for effortless registration
      setDemoOtpNotice(`Verification Code Generated: ${res.otp} (Auto-filled)`);
      setStep(2);
    } catch (err) {
      setLoading(false);
      setError('Failed to send OTP verification code');
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sendSignUpOTP(email);
      setGeneratedOtp(res.otp);
      setOtpCode(res.otp);
      setDemoOtpNotice(`New Code Generated: ${res.otp}`);
    } catch (err) {
      setError('Failed to generate new code');
    } finally {
      setLoading(false);
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

  // --- FORGOT PASSWORD HANDLERS ---
  const handleSendForgotOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!forgotIdentifier.trim()) {
      setError(forgotChannel === 'EMAIL' ? 'Please enter your registered email address' : 'Please enter your registered mobile phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await sendForgotPasswordOTP(forgotIdentifier.trim(), forgotChannel);
      setLoading(false);
      setGeneratedOtp(res.otp);
      setOtpCode(res.otp); // Auto-fill for demo sandbox convenience
      setDemoOtpNotice(`Verification Code Sent to ${res.channel}: ${res.otp} (Auto-filled)`);
      setForgotStep(2);
    } catch (err) {
      setLoading(false);
      setError('Failed to send reset code. Please check your credentials.');
    }
  };

  const handleResendForgotOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await sendForgotPasswordOTP(forgotIdentifier.trim(), forgotChannel);
      setGeneratedOtp(res.otp);
      setOtpCode(res.otp);
      setDemoOtpNotice(`New Code Sent to ${res.channel}: ${res.otp}`);
    } catch (err) {
      setError('Failed to generate new code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP verification code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPasswordWithOTP(forgotIdentifier.trim(), otpCode.trim(), newPassword);
      setLoading(false);
      if (data.user) {
        onAuthSuccess(data.user);
      }
      onClose();
      handleReset();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Password reset failed. Please check the code.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container" style={{ maxWidth: mode === 'register' && step === 1 ? '580px' : '460px', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(225, 29, 72, 0.2)', borderRadius: '8px', color: '#ff859b' }}>
              {mode === 'forgot' ? <KeyRound size={20} /> : <Shield size={20} />}
            </div>
            <div>
              <h2 className="modal-title">
                {mode === 'login'
                  ? 'Welcome to VortiQ'
                  : mode === 'register'
                  ? (step === 1 ? 'Create Official Account' : 'Verify Email Address')
                  : (forgotStep === 1 ? 'Reset Account Password' : 'Verify & Set New Password')}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {mode === 'login'
                  ? 'Access your workspace dashboard & team tasks'
                  : mode === 'register'
                  ? (step === 1 ? 'Register with your official details, photo & department' : `Enter verification code sent to ${email}`)
                  : (forgotStep === 1 ? 'Get a 6-digit OTP via Email or Mobile SMS to reset your password' : `Enter OTP sent to ${forgotIdentifier}`)}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher (Login / Register / Forgot) */}
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
          {mode === 'forgot' && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #6366f1, #9333ea)' }}
            >
              <KeyRound size={14} style={{ marginRight: '0.35rem' }} /> Reset
            </button>
          )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      handleReset();
                      setForgotIdentifier(email || '');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary-glow)',
                      fontSize: '0.785rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
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
          ) : mode === 'register' ? (
            
            /* MODE 2: REGISTRATION FORM */
            step === 1 ? (
              
              /* STEP 1: REGISTRATION DETAILS */
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
                    <div style={{ position: 'relative' }}>
                      <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="deepanshi"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        style={{ paddingLeft: '2.4rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Official Email */}
                <div className="form-group">
                  <label className="form-label">Official Email ID * (OTP will be sent here)</label>
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

                {/* Department & Phone */}
                <div className="grid-responsive">
                  <div className="form-group">
                    <label className="form-label">Department / Unit</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <select
                        className="form-select"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{ paddingLeft: '2.4rem' }}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
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
              
              /* STEP 2: REGISTER OTP VERIFICATION */
              <form onSubmit={handleVerifyAndRegister} className="modal-form">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ff859b', marginBottom: '0.75rem' }}>
                    <KeyRound size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Enter Verification Code</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                    Verification code generated for <strong>{email}</strong>
                  </p>
                </div>

                {/* Sandbox OTP Display Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08))',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    ⚡ Sandbox Instant OTP (Demo Environment)
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.25em', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {generatedOtp || '123456'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp || '123456')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                    >
                      ✓ Auto-Fill Code
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                      disabled={loading}
                    >
                      🔄 Resend New Code
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    6-Digit OTP Code
                  </label>
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
            )
          ) : (
            
            /* MODE 3: FORGOT PASSWORD RESET FLOW */
            forgotStep === 1 ? (
              
              /* FORGOT STEP 1: SELECT CHANNEL & ENTER EMAIL/PHONE */
              <form onSubmit={handleSendForgotOTP} className="modal-form">
                
                {/* Channel Selector: Email vs Phone */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                    Send Verification Code Via:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { setForgotChannel('EMAIL'); setError(''); }}
                      className={`btn ${forgotChannel === 'EMAIL' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.55rem 0.75rem', fontSize: '0.825rem', gap: '0.4rem', justifyContent: 'center' }}
                    >
                      <Mail size={15} />
                      <span>Official Email</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setForgotChannel('PHONE'); setError(''); }}
                      className={`btn ${forgotChannel === 'PHONE' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.55rem 0.75rem', fontSize: '0.825rem', gap: '0.4rem', justifyContent: 'center' }}
                    >
                      <Smartphone size={15} />
                      <span>Mobile SMS</span>
                    </button>
                  </div>
                </div>

                {/* Identifier Input */}
                <div className="form-group">
                  <label className="form-label">
                    {forgotChannel === 'EMAIL' ? 'Registered Email Address *' : 'Registered Phone Number *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    {forgotChannel === 'EMAIL' ? (
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    ) : (
                      <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    )}
                    <input
                      type={forgotChannel === 'EMAIL' ? 'email' : 'tel'}
                      required
                      className="form-input"
                      placeholder={forgotChannel === 'EMAIL' ? 'deepanshi@vortiq.com' : '+1 (555) 019-2834'}
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      style={{ paddingLeft: '2.4rem' }}
                      autoFocus
                    />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.35rem 0 0' }}>
                    {forgotChannel === 'EMAIL'
                      ? 'We will generate an instant verification OTP to your email.'
                      : 'We will dispatch an SMS verification OTP to your mobile device.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => { setMode('login'); handleReset(); }}
                    disabled={loading}
                  >
                    <ArrowLeft size={16} /> Back to Sign In
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, background: 'linear-gradient(135deg, #6366f1, #e11d48)' }}
                    disabled={loading}
                  >
                    {loading ? 'Sending Code...' : 'Send Reset Code →'}
                  </button>
                </div>
              </form>
            ) : (
              
              /* FORGOT STEP 2: VERIFY OTP & ENTER NEW PASSWORD */
              <form onSubmit={handleResetPasswordSubmit} className="modal-form">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '0.75rem' }}>
                    <KeyRound size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reset Your Password</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                    Verification code sent to <strong>{forgotIdentifier}</strong>
                  </p>
                </div>

                {/* Sandbox OTP Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(225, 29, 72, 0.08))',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '10px',
                  padding: '0.9rem',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                    ⚡ Sandbox Password Reset OTP
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.25em', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                    {generatedOtp || '123456'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp || '123456')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                    >
                      ✓ Auto-Fill Code
                    </button>
                    <button
                      type="button"
                      onClick={handleResendForgotOTP}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                      disabled={loading}
                    >
                      🔄 Resend Code
                    </button>
                  </div>
                </div>

                {/* OTP Code Input */}
                <div className="form-group">
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    6-Digit Verification Code
                  </label>
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

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password * (min 6 chars)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      className="form-input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="form-group">
                  <label className="form-label">Confirm New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="form-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setForgotStep(1)}
                    disabled={loading}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                    disabled={loading}
                  >
                    {loading ? 'Resetting Password...' : '✓ Set Password & Sign In'}
                  </button>
                </div>
              </form>
            )
          )}

        </div>
      </div>
    </div>
  );
}
