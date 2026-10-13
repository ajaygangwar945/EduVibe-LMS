import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, registerStudent, registerFaculty } = useAuth();

  const [activeRole, setActiveRole] = useState('student'); // 'student', 'faculty', 'admin'
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: 'Computer Science',
    courseName: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setIsRegistering(false);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Security & Input Validation
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
          setSuccessMsg(res.message);
          setIsRegistering(false);
        }
      } else {
        await login(trimmedEmail, formData.password, activeRole);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setFormData({
      ...formData,
      email: 'admin@eduvibe.com',
      password: 'admin123',
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🎓</span>
            <h1 className="nav-brand" style={{ fontSize: '2.2rem' }}>EduVibe</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Next-Gen Learning Management & Academic Portal
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.7)', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', gap: '0.3rem' }}>
          <button
            type="button"
            className={`tab-btn ${activeRole === 'student' ? 'active' : ''}`}
            style={{ flex: 1, padding: '0.6rem 0.5rem' }}
            onClick={() => handleRoleChange('student')}
          >
            👨‍🎓 Student
          </button>
          <button
            type="button"
            className={`tab-btn ${activeRole === 'faculty' ? 'active' : ''}`}
            style={{ flex: 1, padding: '0.6rem 0.5rem' }}
            onClick={() => handleRoleChange('faculty')}
          >
            👩‍🏫 Faculty
          </button>
          <button
            type="button"
            className={`tab-btn ${activeRole === 'admin' ? 'active' : ''}`}
            style={{ flex: 1, padding: '0.6rem 0.5rem' }}
            onClick={() => handleRoleChange('admin')}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: '#6ee7b7', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Faculty Approval Reminder Banner */}
        {activeRole === 'faculty' && isRegistering && (
          <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)', color: '#fde047', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.825rem' }}>
            ℹ️ <strong>Faculty Notice:</strong> Teacher registrations require Admin approval. You will receive your official Registration Number once approved.
          </div>
        )}

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
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
            <label className="form-label">Email Address (Gmail / College ID)</label>
            <input
              type="email"
              name="email"
              required
              placeholder="user@eduvibe.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              isRegistering
                ? (activeRole === 'faculty' ? 'Submit Faculty Registration' : 'Create Student Account')
                : `Sign In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`
            )}
          </button>
        </form>

        {/* Demo Credentials Helper for Admin */}
        {activeRole === 'admin' && (
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleFillDemoAdmin}
              style={{ width: '100%' }}
            >
              🔑 Click to Pre-fill Admin Credentials
            </button>
          </div>
        )}

        {/* Toggle between Sign In & Registration */}
        {activeRole !== 'admin' && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isRegistering ? (
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
        )}

      </div>
    </div>
  );
}
