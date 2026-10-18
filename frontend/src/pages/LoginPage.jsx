import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { GraduationCapIcon, TeacherIcon, ShieldIcon } from '../components/Icons';
import mascotImage from '../assets/mascot.jpg';

export default function LoginPage() {
  const { login, registerStudent, registerFaculty, registerAdmin, resetPassword } = useAuth();

  const [activeRole, setActiveRole] = useState('student'); // 'student', 'faculty', 'admin'
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Main Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: 'Computer Science',
    courseName: '',
  });

  // Password Reset Fields
  const [resetData, setResetData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
    setResetError('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setIsRegistering(false);
    setIsResettingPassword(false);
    setError('');
    setSuccessMsg('');
    setResetError('');
    setResetSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Input Validation
    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isRegistering && !formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: trimmedEmail,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        courseName: formData.courseName.trim(),
      };

      if (isRegistering) {
        if (activeRole === 'student') {
          await registerStudent(payload);
        } else if (activeRole === 'faculty') {
          const res = await registerFaculty(payload);
          setSuccessMsg(res.message || 'Registration submitted for Admin approval.');
          setIsRegistering(false);
        } else if (activeRole === 'admin') {
          // Blocked by design - Only single master admin allowed
          setError('Admin creation is restricted to the master administrator.');
        }
      } else {
        await login(trimmedEmail, formData.password, activeRole);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const cleanEmail = resetData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setResetError('Please enter a valid email address.');
      return;
    }

    if (resetData.newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetError('New password and confirm password do not match.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await resetPassword(cleanEmail, resetData.newPassword, resetData.confirmPassword);
      setResetSuccess(res.message || 'Password reset successfully!');
      setTimeout(() => {
        setIsResettingPassword(false);
        setFormData((prev) => ({ ...prev, email: cleanEmail, password: '' }));
        setSuccessMsg('Password updated! Please sign in with your new password.');
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-root-container">
      
      {/* Top Bar with Brand Badge & Theme Toggle */}
      <header className="login-top-bar">
        <div className="login-top-brand">
          <div className="brand-icon-badge-sm">
            <GraduationCapIcon size={20} color="#007aff" />
          </div>
          <span className="rainbow-text" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            EduVibe
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Single Unified Card containing both Login and Mascot */}
      <div className="rainbow-border-box unified-auth-card">
        
        {/* LEFT COLUMN: Login / Register / Password Reset Form */}
        <div className="unified-auth-left">
          
          {/* Brand Header */}
          <div className="login-card-header">
            <div className="brand-icon-badge">
              <GraduationCapIcon size={28} color="#007aff" />
            </div>
            <div>
              <h1 className="rainbow-text" style={{ fontSize: '2.1rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                EduVibe
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, marginTop: '0.2rem' }}>
                Next-Gen Learning Management & Academic Portal
              </p>
            </div>
          </div>

          {/* Apple Segmented Role Switcher with Role-Specific Color Coding */}
          <div className="role-segmented-control">
            <button
              type="button"
              className={`role-segmented-btn role-student ${activeRole === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              <GraduationCapIcon size={15} />
              <span>Student</span>
            </button>
            <button
              type="button"
              className={`role-segmented-btn role-faculty ${activeRole === 'faculty' ? 'active' : ''}`}
              onClick={() => handleRoleChange('faculty')}
            >
              <TeacherIcon size={15} />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              className={`role-segmented-btn role-admin ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <ShieldIcon size={15} />
              <span>Admin</span>
            </button>
          </div>

          {/* Status Alerts */}
          {error && (
            <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              ✅ {successMsg}
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW A: PASSWORD RESET FORM (Available for Student, Faculty, Admin) */}
          {/* ============================================================= */}
          {isResettingPassword ? (
            <div>
              <div style={{ marginBottom: '1.2rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  🔑 Reset Account Password
                </h3>
              </div>

              {resetError && (
                <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  ⚠️ {resetError}
                </div>
              )}

              {resetSuccess && (
                <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  ✅ {resetSuccess}
                </div>
              )}

              <form onSubmit={handleResetSubmit}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your registered email"
                    className="form-input"
                    value={resetData.email}
                    onChange={handleResetChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    placeholder="Minimum 6 characters"
                    className="form-input"
                    value={resetData.newPassword}
                    onChange={handleResetChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Re-enter new password"
                    className="form-input"
                    value={resetData.confirmPassword}
                    onChange={handleResetChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Updating Password...' : 'Set New Password'}
                </button>

                <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                    onClick={() => {
                      setIsResettingPassword(false);
                      setResetError('');
                      setResetSuccess('');
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ============================================================= */
            /* VIEW B: SIGN IN / REGISTRATION FORM */
            /* ============================================================= */
            <>
              {/* Faculty Approval Reminder Banner */}
              {activeRole === 'faculty' && isRegistering && (
                <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.825rem' }}>
                  ℹ️ <strong>Faculty Notice:</strong> Teacher registrations require Admin approval. You will receive your official Registration Number once approved.
                </div>
              )}

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit}>
                {isRegistering && activeRole !== 'admin' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Alex Johnson"
                        className="form-input"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        name="department"
                        className="form-select"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="Computer Science">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Comm">Electronics & Communication</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                      </select>
                    </div>

                    {activeRole === 'faculty' && (
                      <div className="form-group">
                        <label className="form-label">Primary Course / Subject Specialization</label>
                        <input
                          type="text"
                          name="courseName"
                          required
                          placeholder="e.g. Data Structures & Algorithms"
                          className="form-input"
                          value={formData.courseName}
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        className="form-input"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Campus Hostel / City Address"
                        className="form-input"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPassword(true);
                          setResetData({ email: formData.email, newPassword: '', confirmPassword: '' });
                          setError('');
                          setSuccessMsg('');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: 0 }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary ${activeRole === 'student' ? 'btn-role-student' : activeRole === 'faculty' ? 'btn-role-faculty' : 'btn-role-admin'}`}
                  style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (
                    isRegistering
                      ? (activeRole === 'faculty' ? 'Submit Faculty Registration' : 'Create Student Account')
                      : `Sign In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`
                  )}
                </button>
              </form>

              {/* Bottom Policy & Registration Switcher */}
              <div style={{ marginTop: '1.4rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {activeRole === 'admin' ? null : isRegistering ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setIsRegistering(false)}
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    New {activeRole}?{' '}
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setIsRegistering(true)}
                    >
                      Create an account
                    </button>
                  </span>
                )}
              </div>
            </>
          )}

        </div>

        {/* VERTICAL DIVIDER */}
        <div className="unified-card-divider"></div>

        {/* RIGHT COLUMN: 3D Academic Mascot Showcase */}
        <div className="unified-auth-right">
          <div className="mascot-inner-container">
            
            <div className="mascot-img-container">
              <img
                src={mascotImage}
                alt="EduVibe 3D Academic Mascot"
                className="mascot-static-img"
              />
            </div>

            <div className="mascot-badge-tag">
              <span className="mascot-sparkle-dot"></span>
              <span>Next-Gen Academic Excellence</span>
            </div>

            <h2 className="mascot-headline">
              Celebrate Learning & Innovation
            </h2>

            <p className="mascot-desc">
              Your comprehensive campus workspace for intelligent courses, interactive assessments, and real-time faculty-student collaboration.
            </p>

            <div className="mascot-pills-row">
              <div className="mascot-pill">
                <span>🚀</span>
                <span>Smart Subjects</span>
              </div>
              <div className="mascot-pill">
                <span>📝</span>
                <span>Live Assessments</span>
              </div>
              <div className="mascot-pill">
                <span>📊</span>
                <span>Academic Insights</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
