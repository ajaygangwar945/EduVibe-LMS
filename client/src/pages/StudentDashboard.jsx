import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'browse', 'quizzes', 'assignments', 'attendance', 'profile'
  const [profileData, setProfileData] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Assignment Modal / Upload State
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Active Video Modal State for lecture streaming
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses to Browse
  const fetchAllCourses = async () => {
    try {
      const res = await fetch('/api/student/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAllCourses(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/student/quizzes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setQuizzes(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/student/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAssignments(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Attendance
  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAttendanceData(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'browse') fetchAllCourses();
    if (activeTab === 'quizzes') fetchQuizzes();
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'attendance') fetchAttendance();
  }, [activeTab]);

  // Enroll Course Handler
  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: data.message });
        fetchAllCourses();
        fetchDashboard();
      } else {
        setActionMsg({ type: 'danger', text: data.message });
      }
    } catch (err) {
      setActionMsg({ type: 'danger', text: 'Enrollment failed.' });
    }
  };

  // Submit Quiz Handler
  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      // Build answers array based on questions
      const answersArray = activeQuiz.questions.map((q, idx) =>
        selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      );

      const res = await fetch(`/api/student/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: answersArray }),
      });

      const data = await res.json();
      if (data.success) {
        setQuizResult(data.data);
        fetchQuizzes();
      } else {
        alert(data.message || 'Error submitting quiz.');
      }
    } catch (err) {
      alert('Failed to submit quiz.');
    }
  };

  // Submit Assignment PDF Handler
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedAssignment) return;

    // Security & File Validation
    const fileName = uploadFile.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      alert('Security Validation: Only PDF files (.pdf) are permitted for assignment submissions.');
      return;
    }
    if (uploadFile.size > 25 * 1024 * 1024) {
      alert('File Size Error: Assignment PDF must be under 25MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('submissionFile', uploadFile);

    try {
      const res = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'Assignment PDF submitted successfully!' });
        setSelectedAssignment(null);
        setUploadFile(null);
        fetchAssignments();
      } else {
        alert(data.message || 'Submission failed.');
      }
    } catch (err) {
      alert('Failed to upload assignment.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span>🎓</span> EduVibe Student Portal
        </div>
        <div className="nav-profile">
          <div className="user-pill">
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.regNumber || 'Student'}</div>
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
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 My Courses ({profileData?.enrolledCourses?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            ➕ Add New Courses
          </button>
          <button
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            📝 Quizzes & Tests
          </button>
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📤 Submit Assignments
          </button>
          <button
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            📊 My Attendance
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
        </div>

        {/* TAB 1: ENROLLED COURSES */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>My Enrolled Courses</h2>
                <p style={{ color: 'var(--text-muted)' }}>Access your lecture notes, PDFs, and video lectures</p>
              </div>
              <button onClick={() => setActiveTab('browse')} className="btn btn-primary btn-sm">
                + Browse More Courses
              </button>
            </div>

            {(!profileData?.enrolledCourses || profileData.enrolledCourses.length === 0) ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You are not enrolled in any courses yet.
                </p>
                <button onClick={() => setActiveTab('browse')} className="btn btn-primary">
                  Browse Courses to Enroll
                </button>
              </div>
            ) : (
              <div className="grid-cols-2">
                {profileData.enrolledCourses.map((course) => (
                  <div key={course._id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-info">{course.code}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{course.department}</span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      {course.description || 'Comprehensive university course material.'}
                    </p>

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: 'var(--text-muted)' }}>
                        Course Materials ({course.materials?.length || 0})
                      </h4>

                      {(!course.materials || course.materials.length === 0) ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No lecture notes or videos uploaded yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {course.materials.map((mat, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(15, 23, 42, 0.5)',
                                padding: '0.6rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>{mat.type === 'video' ? '🎬' : '📄'}</span>
                                <span style={{ fontWeight: 500 }}>{mat.title}</span>
                              </div>

                              {mat.type === 'video' ? (
                                <button
                                  onClick={() => setActiveVideo(mat)}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                >
                                  Watch Video
                                </button>
                              ) : (
                                <a
                                  href={mat.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                                >
                                  View / Download PDF
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BROWSE & ADD NEW COURSES */}
        {activeTab === 'browse' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Course Catalog</h2>
              <p style={{ color: 'var(--text-muted)' }}>Explore courses from all departments and enroll with 1 click</p>
            </div>

            <div className="grid-cols-3">
              {allCourses.map((c) => (
                <div key={c._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-info">{c.code}</span>
                      <span className="badge badge-warning">{c.department}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{c.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      {c.description || 'University syllabus curriculum.'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Instructor: <strong>{c.faculty?.name || 'Faculty Member'}</strong>
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    {c.isEnrolled ? (
                      <button disabled className="btn btn-secondary btn-sm" style={{ width: '100%', opacity: 0.7 }}>
                        ✓ Already Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(c._id)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUIZZES */}
        {activeTab === 'quizzes' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Quizzes & Online Tests</h2>
              <p style={{ color: 'var(--text-muted)' }}>Test your knowledge and get immediate grading results</p>
            </div>

            {quizzes.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No quizzes currently available for your enrolled courses.</p>
              </div>
            ) : (
              <div className="grid-cols-2">
                {quizzes.map((q) => (
                  <div key={q.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-info">{q.course?.code}</span>
                      <span className="badge badge-warning">⏱️ {q.durationMinutes} Mins</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{q.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Questions: {q.totalQuestions}
                    </p>

                    {q.hasSubmitted ? (
                      <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.95rem' }}>
                          ✓ Completed: Score {q.score} / {q.totalPoints}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                          Percentage: {((q.score / q.totalPoints) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveQuiz(q);
                          setSelectedAnswers({});
                          setQuizResult(null);
                        }}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        Start Quiz Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUBMIT ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Course Assignments</h2>
              <p style={{ color: 'var(--text-muted)' }}>View deadlines and upload your submission PDF files</p>
            </div>

            {assignments.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No assignments posted yet.</p>
              </div>
            ) : (
              <div className="grid-cols-2">
                {assignments.map((a) => (
                  <div key={a.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-info">{a.course?.code}</span>
                      <span className="badge badge-danger">
                        Due: {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{a.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {a.description}
                    </p>

                    {a.fileAttachmentUrl && (
                      <div style={{ marginBottom: '1rem' }}>
                        <a
                          href={a.fileAttachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          📎 View Assignment Brief (PDF)
                        </a>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.9rem' }}>
                      {a.hasSubmitted ? (
                        <div style={{ background: 'var(--success-bg)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.9rem' }}>
                            ✓ Submitted on {new Date(a.submission.submittedAt).toLocaleDateString()}
                          </div>
                          {a.submission.marks !== null ? (
                            <div style={{ marginTop: '0.4rem', color: '#fff', fontSize: '0.875rem' }}>
                              Grade: <strong>{a.submission.marks} / {a.maxMarks}</strong>
                              {a.submission.feedback && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Feedback: {a.submission.feedback}</div>}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                              Pending faculty grading
                            </div>
                          )}
                          <div style={{ marginTop: '0.5rem' }}>
                            <button
                              onClick={() => setSelectedAssignment(a)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            >
                              Re-upload PDF
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(a)}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                        >
                          Upload Assignment PDF
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Attendance Tracker</h2>
              <p style={{ color: 'var(--text-muted)' }}>Keep track of your academic presence requirements (Minimum 75%)</p>
            </div>

            {/* Attendance Overview Card */}
            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: Number(attendanceData?.overallPercentage || 100) >= 75 ? '#34d399' : '#f87171' }}>
                  {attendanceData?.overallPercentage || 100}%
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Overall Attendance</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {attendanceData?.presentClasses || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Classes Attended</div>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                  {attendanceData?.totalClasses || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Total Classes Held</div>
              </div>
            </div>

            {/* Subject-Wise Breakdown Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Subject-Wise Breakdown</h3>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Attended</th>
                      <th>Total</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!attendanceData?.courseBreakdown || attendanceData.courseBreakdown.length === 0) ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No attendance records entered by faculty yet.
                        </td>
                      </tr>
                    ) : (
                      attendanceData.courseBreakdown.map((item, idx) => (
                        <tr key={idx}>
                          <td><span className="badge badge-info">{item.courseCode}</span></td>
                          <td><strong>{item.courseTitle}</strong></td>
                          <td>{item.present}</td>
                          <td>{item.total}</td>
                          <td style={{ fontWeight: 700, color: Number(item.percentage) >= 75 ? '#34d399' : '#f87171' }}>
                            {item.percentage}%
                          </td>
                          <td>
                            {Number(item.percentage) >= 75 ? (
                              <span className="badge badge-success">Good Standing</span>
                            ) : (
                              <span className="badge badge-danger">Low Attendance</span>
                            )}
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

        {/* TAB 6: PROFILE */}
        {activeTab === 'profile' && (
          <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div className="avatar-circle" style={{ width: '70px', height: '70px', fontSize: '1.8rem', margin: '0 auto 1rem' }}>
                {user?.name?.charAt(0) || 'S'}
              </div>
              <h2>{user?.name}</h2>
              <span className="badge badge-info" style={{ marginTop: '0.4rem' }}>
                Registration No: {user?.regNumber}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span style={{ fontWeight: 500 }}>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <span style={{ fontWeight: 500 }}>{user?.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                <span style={{ fontWeight: 500 }}>{user?.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                <span style={{ fontWeight: 500 }}>{user?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* QUIZ TAKING MODAL */}
      {activeQuiz && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3>📝 {activeQuiz.title}</h3>
              <span className="badge badge-warning">⏱️ {activeQuiz.durationMinutes} Minutes</span>
            </div>

            {quizResult ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h2>Quiz Completed!</h2>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', margin: '1rem 0' }}>
                  {quizResult.score} / {quizResult.totalPoints}
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Your score has been saved to your student profile!
                </p>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setQuizResult(null);
                  }}
                  className="btn btn-primary"
                >
                  Close Quiz
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                  {activeQuiz.questions.map((q, qIndex) => (
                    <div key={q._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.2rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.85rem' }}>
                        {qIndex + 1}. {q.questionText}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, optIndex) => (
                          <label
                            key={optIndex}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.6rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              background: selectedAnswers[qIndex] === optIndex ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                              border: selectedAnswers[qIndex] === optIndex ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              checked={selectedAnswers[qIndex] === optIndex}
                              onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: optIndex })}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button onClick={() => setActiveQuiz(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button onClick={handleSubmitQuiz} className="btn btn-primary">
                    Submit Quiz Answers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASSIGNMENT UPLOAD MODAL */}
      {selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>📤 Submit: {selectedAssignment.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Please select your completed PDF file to submit.
            </p>

            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label className="form-label">Upload Submission PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  required
                  className="form-input"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setSelectedAssignment(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn btn-primary">
                  {uploading ? 'Uploading PDF...' : 'Upload & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO LECTURE PLAYER MODAL */}
      {activeVideo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>🎬 {activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
              <video
                src={activeVideo.fileUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '480px', display: 'block' }}
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
