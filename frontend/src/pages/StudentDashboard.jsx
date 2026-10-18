import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  GraduationCapIcon,
  LogoutIcon,
  BookOpenIcon,
  PlusCircleIcon,
  ClipboardListIcon,
  UploadCloudIcon,
  CalendarCheckIcon,
  UserIcon,
  VideoPlayIcon,
  FileTextIcon,
  DownloadIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PaperclipIcon,
  MailIcon,
  BuildingIcon,
  PhoneIcon,
  MapPinIcon,
  AwardIcon,
} from '../components/Icons';

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
    window.scrollTo(0, 0);
    fetchDashboard();
  }, [token]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="portal-student" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <GraduationCapIcon size={26} color="#007aff" />
          <span>EduVibe Student Portal</span>
        </div>
        <div className="nav-profile">
          <ThemeToggle />
          <button
            type="button"
            className={`nav-btn nav-user-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            title="Open Student Profile"
            aria-label="Student Profile"
          >
            <div className="avatar-circle nav-avatar">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <span className="nav-user-name">{user?.name || 'Student'}</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="nav-btn nav-logout-btn"
            title="Logout from Student Portal"
            aria-label="Logout"
          >
            <LogoutIcon size={15} />
            <span>Logout</span>
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
              color: actionMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${actionMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {actionMsg.type === 'success' ? (
                <CheckCircleIcon size={18} color="var(--success)" />
              ) : (
                <AlertCircleIcon size={18} color="var(--danger)" />
              )}
              <span>{actionMsg.text}</span>
            </div>
            <button
              onClick={() => setActionMsg({ type: '', text: '' })}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
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
            <BookOpenIcon size={16} />
            <span>My Courses ({profileData?.enrolledCourses?.length || 0})</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <PlusCircleIcon size={16} />
            <span>Browse Courses</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <ClipboardListIcon size={16} />
            <span>Quizzes & Tests</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <UploadCloudIcon size={16} />
            <span>Assignments</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarCheckIcon size={16} />
            <span>My Attendance</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon size={16} />
            <span>Profile</span>
          </button>
        </div>

        {/* TAB 1: ENROLLED COURSES */}
        {activeTab === 'courses' && (
          <div>
            <div className="dashboard-section-header">
              <div>
                <h2>My Enrolled Courses</h2>
                <p>Access your lecture notes, PDFs, and video lectures</p>
              </div>
              <button onClick={() => setActiveTab('browse')} className="btn btn-primary btn-sm" style={{ gap: '0.45rem' }}>
                <PlusCircleIcon size={15} />
                <span>Browse More Courses</span>
              </button>
            </div>

            {(!profileData?.enrolledCourses || profileData.enrolledCourses.length === 0) ? (
              <div className="glass-panel empty-state-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div className="empty-state-icon-box">
                  <BookOpenIcon size={36} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  No Enrolled Courses Yet
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                  Explore university courses, lecture notes, recordings, and assignments in the syllabus catalog.
                </p>
                <button onClick={() => setActiveTab('browse')} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                  <PlusCircleIcon size={16} />
                  <span>Browse Courses to Enroll</span>
                </button>
              </div>
            ) : (
              <div className="grid-cols-2">
                {profileData.enrolledCourses.map((course) => (
                  <div key={course._id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-info">{course.code}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>{course.department}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      {course.description || 'Comprehensive university course material.'}
                    </p>

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <FileTextIcon size={14} color="var(--primary)" />
                        <span>Course Materials ({course.materials?.length || 0})</span>
                      </h4>

                      {(!course.materials || course.materials.length === 0) ? (
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No lecture notes or videos uploaded yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                          {course.materials.map((mat, idx) => (
                            <div key={idx} className="course-material-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                                {mat.type === 'video' ? (
                                  <VideoPlayIcon size={18} color="var(--primary)" />
                                ) : (
                                  <FileTextIcon size={18} color="var(--primary)" />
                                )}
                                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {mat.title}
                                </span>
                              </div>

                              {mat.type === 'video' ? (
                                <button
                                  onClick={() => setActiveVideo(mat)}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', flexShrink: 0 }}
                                >
                                  <VideoPlayIcon size={13} />
                                  <span>Watch Video</span>
                                </button>
                              ) : (
                                <a
                                  href={mat.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', flexShrink: 0 }}
                                >
                                  <DownloadIcon size={13} />
                                  <span>View PDF</span>
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
            <div className="dashboard-section-header">
              <div>
                <h2>Course Catalog</h2>
                <p>Explore courses from all departments and enroll with 1 click</p>
              </div>
            </div>

            <div className="grid-cols-3">
              {allCourses.map((c) => (
                <div key={c._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span className="badge badge-info">{c.code}</span>
                      <span className="badge badge-warning">{c.department}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{c.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {c.description || 'University syllabus curriculum.'}
                    </p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                      Instructor: <strong style={{ color: 'var(--text-main)' }}>{c.faculty?.name || 'Faculty Member'}</strong>
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    {c.isEnrolled ? (
                      <button disabled className="btn btn-secondary btn-sm" style={{ width: '100%', opacity: 0.75, gap: '0.4rem', cursor: 'default' }}>
                        <CheckCircleIcon size={14} color="var(--success)" />
                        <span>Already Enrolled</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(c._id)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', gap: '0.45rem' }}
                      >
                        <PlusCircleIcon size={14} />
                        <span>Enroll Now</span>
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
            <div className="dashboard-section-header">
              <div>
                <h2>Quizzes & Online Tests</h2>
                <p>Test your knowledge and get immediate grading results</p>
              </div>
            </div>

            {quizzes.length === 0 ? (
              <div className="glass-panel empty-state-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div className="empty-state-icon-box">
                  <ClipboardListIcon size={36} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  No Quizzes Available
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  There are no active quizzes posted for your enrolled courses right now.
                </p>
              </div>
            ) : (
              <div className="grid-cols-2">
                {quizzes.map((q) => (
                  <div key={q.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span className="badge badge-info">{q.course?.code}</span>
                      <span className="badge badge-warning" style={{ gap: '0.35rem' }}>
                        <ClockIcon size={12} />
                        <span>{q.durationMinutes} Mins</span>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>{q.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                      Questions: <strong style={{ color: 'var(--text-main)' }}>{q.totalQuestions}</strong>
                    </p>

                    {q.hasSubmitted ? (
                      <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircleIcon size={16} />
                          <span>Completed: Score {q.score} / {q.totalPoints}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
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
                        style={{ width: '100%', gap: '0.5rem' }}
                      >
                        <ClipboardListIcon size={15} />
                        <span>Start Quiz Now</span>
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
            <div className="dashboard-section-header">
              <div>
                <h2>Course Assignments</h2>
                <p>View deadlines and upload your submission PDF files</p>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="glass-panel empty-state-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
                <div className="empty-state-icon-box">
                  <UploadCloudIcon size={36} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  No Assignments Found
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No assignments have been posted by faculty yet.
                </p>
              </div>
            ) : (
              <div className="grid-cols-2">
                {assignments.map((a) => (
                  <div key={a.id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span className="badge badge-info">{a.course?.code}</span>
                      <span className="badge badge-danger" style={{ gap: '0.35rem' }}>
                        <ClockIcon size={12} />
                        <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{a.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                      {a.description}
                    </p>

                    {a.fileAttachmentUrl && (
                      <div style={{ marginBottom: '1rem' }}>
                        <a
                          href={a.fileAttachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.45rem' }}
                        >
                          <PaperclipIcon size={14} color="var(--primary)" />
                          <span>View Assignment Brief (PDF)</span>
                        </a>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.9rem' }}>
                      {a.hasSubmitted ? (
                        <div style={{ background: 'var(--success-bg)', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(52, 199, 89, 0.35)' }}>
                          <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <CheckCircleIcon size={15} />
                            <span>Submitted on {new Date(a.submission.submittedAt).toLocaleDateString()}</span>
                          </div>
                          {a.submission.marks !== null ? (
                            <div style={{ marginTop: '0.45rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
                              Grade: <strong style={{ color: 'var(--text-main)' }}>{a.submission.marks} / {a.maxMarks}</strong>
                              {a.submission.feedback && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                                  Feedback: {a.submission.feedback}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                              Pending faculty grading
                            </div>
                          )}
                          <div style={{ marginTop: '0.65rem' }}>
                            <button
                              onClick={() => setSelectedAssignment(a)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.4rem' }}
                            >
                              <UploadCloudIcon size={13} />
                              <span>Re-upload PDF</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(a)}
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%', gap: '0.45rem' }}
                        >
                          <UploadCloudIcon size={14} />
                          <span>Upload Assignment PDF</span>
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
            <div className="dashboard-section-header">
              <div>
                <h2>Attendance Tracker</h2>
                <p>Keep track of your academic presence requirements (Minimum 75%)</p>
              </div>
            </div>

            {/* Attendance Overview Card */}
            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.6rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: Number(attendanceData?.overallPercentage || 100) >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                  {attendanceData?.overallPercentage || 100}%
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <AwardIcon size={16} color="var(--primary)" />
                  <span>Overall Attendance</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.6rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {attendanceData?.presentClasses || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <CheckCircleIcon size={16} color="var(--success)" />
                  <span>Classes Attended</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.6rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dim)' }}>
                  {attendanceData?.totalClasses || 0}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <CalendarCheckIcon size={16} color="var(--text-dim)" />
                  <span>Total Classes Held</span>
                </div>
              </div>
            </div>

            {/* Subject-Wise Breakdown Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Subject-Wise Breakdown</h3>
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
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>
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
                          <td style={{ fontWeight: 700, color: Number(item.percentage) >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                            {item.percentage}%
                          </td>
                          <td>
                            {Number(item.percentage) >= 75 ? (
                              <span className="badge badge-success" style={{ gap: '0.3rem' }}>
                                <CheckCircleIcon size={12} />
                                <span>Good Standing</span>
                              </span>
                            ) : (
                              <span className="badge badge-danger" style={{ gap: '0.3rem' }}>
                                <AlertCircleIcon size={12} />
                                <span>Low Attendance</span>
                              </span>
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
          <div className="glass-panel profile-card">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                className="avatar-circle"
                style={{
                  width: '74px',
                  height: '74px',
                  fontSize: '2rem',
                  margin: '0 auto 1rem',
                  boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)',
                }}
              >
                {user?.name?.charAt(0) || 'S'}
              </div>
              <h2 style={{ color: 'var(--text-main)' }}>{user?.name}</h2>
              <span className="badge badge-info" style={{ marginTop: '0.5rem' }}>
                Registration No: {user?.regNumber}
              </span>
            </div>

            <div>
              <div className="profile-row">
                <span className="profile-label">
                  <MailIcon size={16} color="var(--primary)" />
                  <span>Email Address</span>
                </span>
                <span className="profile-value">{user?.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">
                  <BuildingIcon size={16} color="var(--primary)" />
                  <span>Department</span>
                </span>
                <span className="profile-value">{user?.department}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">
                  <PhoneIcon size={16} color="var(--primary)" />
                  <span>Phone Number</span>
                </span>
                <span className="profile-value">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">
                  <MapPinIcon size={16} color="var(--primary)" />
                  <span>Campus Address</span>
                </span>
                <span className="profile-value">{user?.address || 'Not provided'}</span>
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
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <ClipboardListIcon size={20} color="var(--primary)" />
                <span>{activeQuiz.title}</span>
              </h3>
              <span className="badge badge-warning" style={{ gap: '0.35rem' }}>
                <ClockIcon size={13} />
                <span>{activeQuiz.durationMinutes} Minutes</span>
              </span>
            </div>

            {quizResult ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <AwardIcon size={54} color="var(--success)" />
                </div>
                <h2>Quiz Completed!</h2>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', margin: '1rem 0' }}>
                  {quizResult.score} / {quizResult.totalPoints}
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Your score has been registered to your student academic record!
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  {activeQuiz.questions.map((q, qIndex) => (
                    <div key={q._id || qIndex} className="quiz-question-box">
                      <div style={{ fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
                        {qIndex + 1}. {q.questionText}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, optIndex) => (
                          <label
                            key={optIndex}
                            className={`quiz-option-label ${selectedAnswers[qIndex] === optIndex ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              checked={selectedAnswers[qIndex] === optIndex}
                              onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: optIndex })}
                              style={{ accentColor: 'var(--primary)' }}
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
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <UploadCloudIcon size={20} color="var(--primary)" />
              <span>Submit: {selectedAssignment.title}</span>
            </h3>
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
                <button type="submit" disabled={uploading} className="btn btn-primary" style={{ gap: '0.45rem' }}>
                  <UploadCloudIcon size={15} />
                  <span>{uploading ? 'Uploading PDF...' : 'Upload & Submit'}</span>
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
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <VideoPlayIcon size={20} color="var(--primary)" />
                <span>{activeVideo.title}</span>
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.3rem', cursor: 'pointer', padding: '0.25rem' }}
                aria-label="Close Video"
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
