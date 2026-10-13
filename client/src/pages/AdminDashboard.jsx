import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'approvals', 'users', 'reports'
  const [stats, setStats] = useState(null);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Approve Faculty Modal State
  const [approvingFaculty, setApprovingFaculty] = useState(null);
  const [customRegNumber, setCustomRegNumber] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Pending Faculty
  const fetchPendingFaculty = async () => {
    try {
      const res = await fetch('/api/admin/pending-faculty', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPendingFaculty(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch All Users
  const fetchUsers = async () => {
    try {
      const url = userRoleFilter ? `/api/admin/users?role=${userRoleFilter}` : '/api/admin/users';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAllUsers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      const res = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReportsData(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingFaculty();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab, userRoleFilter]);

  // Handle Approve Faculty
  const handleApprove = async (e) => {
    e.preventDefault();
    if (!approvingFaculty) return;

    try {
      const res = await fetch(`/api/admin/approve-faculty/${approvingFaculty._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customRegNumber: customRegNumber || undefined,
          newPassword: customPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        setApprovingFaculty(null);
        setCustomRegNumber('');
        setCustomPassword('');
        fetchPendingFaculty();
        fetchStats();
      } else {
        alert(data.message || 'Failed to approve faculty');
      }
    } catch (err) {
      alert('Error approving faculty member');
    }
  };

  // Handle Reject Faculty
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject and remove this faculty registration?')) return;

    try {
      const res = await fetch(`/api/admin/reject-faculty/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'Faculty registration rejected and removed.' });
        fetchPendingFaculty();
        fetchStats();
      }
    } catch (err) {
      alert('Error rejecting faculty member');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span>🛡️</span> EduVibe Admin Console
        </div>
        <div className="nav-profile">
          <div className="user-pill">
            <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>System Administrator</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>admin@eduvibe.com</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="page-container">

        {/* Action Alert Banner */}
        {actionMsg.text && (
          <div
            style={{
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              background: actionMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: actionMsg.type === 'success' ? '#34d399' : '#f87171',
              border: `1px solid ${actionMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{actionMsg.text}</span>
            <button
              onClick={() => setActionMsg({ type: '', text: '' })}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📈 Overview & Stats
          </button>
          <button
            className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('approvals');
              fetchPendingFaculty();
            }}
          >
            ⏳ Pending Faculty Approvals ({pendingFaculty.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Directory
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📑 Institutional Reports
          </button>
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2>Campus Administration Overview</h2>
              <p style={{ color: 'var(--text-muted)' }}>Real-time statistics across all departments and academic roles</p>
            </div>

            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
              <div className="glass-card" style={{ borderLeft: '4px solid #6366f1' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Registered Students</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {stats?.totalStudents || 0}
                </div>
                <div style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Active & Enrolled</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Faculty Members</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {stats?.totalFaculty || 0}
                </div>
                <div style={{ color: '#38bdf8', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Approved by Admin</div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending Faculty Approvals</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
                  {stats?.pendingFaculty || 0}
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Review requests →
                  </button>
                </div>
              </div>

              <div className="glass-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Academic Courses</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {stats?.totalCourses || 0}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Active Syllabus Catalog</div>
              </div>
            </div>

            {/* Quick Action Pending Notice */}
            {pendingFaculty.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: '#fbbf24', fontSize: '1.15rem' }}>⚠️ Action Required: Pending Teacher Approvals</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      There are {pendingFaculty.length} faculty registration requests waiting for official registration numbers and activation.
                    </p>
                  </div>
                  <button onClick={() => setActiveTab('approvals')} className="btn btn-primary btn-sm">
                    Review & Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENDING FACULTY APPROVALS */}
        {activeTab === 'approvals' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Pending Faculty Approvals</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Verify teacher credentials, assign their official Registration Number, and activate their access
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email (Gmail / College)</th>
                      <th>Department</th>
                      <th>Course Specialization</th>
                      <th>Phone & Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFaculty.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                          ✓ No pending faculty requests. All registrations are approved!
                        </td>
                      </tr>
                    ) : (
                      pendingFaculty.map((fac) => (
                        <tr key={fac._id}>
                          <td><strong>{fac.name}</strong></td>
                          <td>{fac.email}</td>
                          <td><span className="badge badge-info">{fac.department}</span></td>
                          <td>{fac.courseName || 'General Faculty'}</td>
                          <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            <div>{fac.phone || 'No phone'}</div>
                            <div>{fac.address || 'No address'}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  setApprovingFaculty(fac);
                                  setCustomRegNumber(`FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
                                  setCustomPassword('');
                                }}
                                className="btn btn-success btn-sm"
                              >
                                ✓ Approve & Assign Reg No
                              </button>
                              <button
                                onClick={() => handleReject(fac._id)}
                                className="btn btn-danger btn-sm"
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Campus User Directory</h2>
                <p style={{ color: 'var(--text-muted)' }}>View registered students, faculty, and administrative staff</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn btn-sm ${userRoleFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserRoleFilter('')}
                >
                  All Users
                </button>
                <button
                  className={`btn btn-sm ${userRoleFilter === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserRoleFilter('student')}
                >
                  Students
                </button>
                <button
                  className={`btn btn-sm ${userRoleFilter === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserRoleFilter('faculty')}
                >
                  Faculty
                </button>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Reg Number</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Approval Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <span className="badge badge-info">{u.regNumber || 'PENDING'}</span>
                        </td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className="badge" style={{
                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'faculty' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: u.role === 'admin' ? '#f87171' : u.role === 'faculty' ? '#34d399' : '#818cf8',
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{u.department}</td>
                        <td>
                          {u.isApproved ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-warning">Pending Approval</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Institutional Academic Reports</h2>
              <p style={{ color: 'var(--text-muted)' }}>Course enrollments, study materials uploaded, and total attendance records</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Course Enrollment & Resource Summary</h3>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Title</th>
                      <th>Department</th>
                      <th>Assigned Instructor</th>
                      <th>Enrolled Students</th>
                      <th>Uploaded PDFs/Videos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!reportsData?.coursesSummary || reportsData.coursesSummary.length === 0) ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No course records found.
                        </td>
                      </tr>
                    ) : (
                      reportsData.coursesSummary.map((item, idx) => (
                        <tr key={idx}>
                          <td><span className="badge badge-info">{item.code}</span></td>
                          <td><strong>{item.title}</strong></td>
                          <td>{item.department}</td>
                          <td>{item.facultyName}</td>
                          <td><span className="badge badge-success">👥 {item.enrolledCount} Students</span></td>
                          <td><span className="badge badge-warning">📁 {item.materialsCount} Resources</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* APPROVE FACULTY MODAL */}
      {approvingFaculty && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>
              Approve Faculty: {approvingFaculty.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Department: <strong>{approvingFaculty.department}</strong> | Email: <strong>{approvingFaculty.email}</strong>
            </p>

            <form onSubmit={handleApprove}>
              <div className="form-group">
                <label className="form-label">Assign Official Registration Number</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={customRegNumber}
                  onChange={(e) => setCustomRegNumber(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Auto-generated format: FAC-2026-XXXX (editable)
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Set / Reset Password (Optional)</label>
                <input
                  type="text"
                  placeholder="Leave blank to keep teacher's original password"
                  className="form-input"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setApprovingFaculty(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm Approval & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
