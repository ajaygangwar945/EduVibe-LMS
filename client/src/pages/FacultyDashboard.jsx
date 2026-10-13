import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function FacultyDashboard() {
  const { user, token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'attendance', 'quizzes', 'assignments'
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Course Creation Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', code: '', department: user?.department || 'Computer Science', description: '' });

  // Material Upload Modal State (PDF / Video)
  const [selectedCourseForMaterial, setSelectedCourseForMaterial] = useState(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);

  // Attendance State
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentStatusMap, setStudentStatusMap] = useState({});

  // Quiz Builder State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    courseId: '',
    durationMinutes: 15,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 1,
      },
    ],
  });
  const [quizzesList, setQuizzesList] = useState([]);

  // Assignment Creation & Grading State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxMarks: 100,
  });
  const [assignmentBriefFile, setAssignmentBriefFile] = useState(null);
  const [assignmentsList, setAssignmentsList] = useState([]);

  // Grade Modal State
  const [gradeModal, setGradeModal] = useState(null); // { assignmentId, submission }
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Fetch Faculty Courses
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/faculty/my-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data);
        if (data.data.length > 0 && !selectedCourseForAttendance) {
          setSelectedCourseForAttendance(data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/faculty/quizzes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setQuizzesList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/faculty/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAssignmentsList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'quizzes') fetchQuizzes();
    if (activeTab === 'assignments') fetchAssignments();
  }, [activeTab]);

  // Load Enrolled Students when course selected for Attendance
  useEffect(() => {
    const fetchStudentsForCourse = async () => {
      if (!selectedCourseForAttendance) return;
      try {
        const res = await fetch(`/api/faculty/courses/${selectedCourseForAttendance}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setEnrolledStudents(data.data);
          // Default all to 'present'
          const initialMap = {};
          data.data.forEach((st) => {
            initialMap[st._id] = 'present';
          });
          setStudentStatusMap(initialMap);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudentsForCourse();
  }, [selectedCourseForAttendance]);

  // Handle Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/faculty/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'New course created successfully!' });
        setShowCourseModal(false);
        setNewCourse({ title: '', code: '', department: user?.department || 'Computer Science', description: '' });
        fetchMyCourses();
      } else {
        alert(data.message || 'Failed to create course');
      }
    } catch (err) {
      alert('Error creating course.');
    }
  };

  // Handle Material Upload (PDF or Video)
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialFile || !selectedCourseForMaterial) return;

    // Security & File Validation
    const ext = materialFile.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx', 'mp4', 'webm', 'mkv', 'mov', 'avi'];
    if (!allowedExtensions.includes(ext)) {
      alert('Security Validation: Only PDF documents and video files (.mp4, .webm, .mkv) are allowed.');
      return;
    }
    if (materialFile.size > 100 * 1024 * 1024) {
      alert('File Size Error: File exceeds the 100MB limit.');
      return;
    }

    setUploadingMaterial(true);
    const formData = new FormData();
    formData.append('file', materialFile);
    formData.append('title', materialTitle || materialFile.originalname);

    try {
      const res = await fetch(`/api/faculty/courses/${selectedCourseForMaterial}/upload-material`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'Material uploaded successfully!' });
        setSelectedCourseForMaterial(null);
        setMaterialFile(null);
        setMaterialTitle('');
        fetchMyCourses();
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading material');
    } finally {
      setUploadingMaterial(false);
    }
  };

  // Handle Submit Attendance
  const handleSaveAttendance = async () => {
    if (!selectedCourseForAttendance || enrolledStudents.length === 0) return;

    const records = enrolledStudents.map((st) => ({
      student: st._id,
      status: studentStatusMap[st._id] || 'present',
    }));

    try {
      const res = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: selectedCourseForAttendance,
          date: attendanceDate,
          records,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `Attendance saved for date: ${attendanceDate}!` });
      } else {
        alert(data.message || 'Failed to save attendance');
      }
    } catch (err) {
      alert('Error saving attendance');
    }
  };

  // Handle Create Quiz
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/faculty/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quizForm),
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'Quiz created and published!' });
        setShowQuizModal(false);
        fetchQuizzes();
      } else {
        alert(data.message || 'Failed to create quiz');
      }
    } catch (err) {
      alert('Error creating quiz');
    }
  };

  // Handle Create Assignment
  const handleSaveAssignment = async (e) => {
    e.preventDefault();

    if (assignmentBriefFile) {
      if (!assignmentBriefFile.name.toLowerCase().endsWith('.pdf')) {
        alert('Security Validation: Assignment brief attachment must be a PDF file (.pdf).');
        return;
      }
      if (assignmentBriefFile.size > 25 * 1024 * 1024) {
        alert('File Size Error: Assignment brief must be under 25MB.');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', assignmentForm.title);
    formData.append('description', assignmentForm.description);
    formData.append('courseId', assignmentForm.courseId);
    formData.append('dueDate', assignmentForm.dueDate);
    formData.append('maxMarks', assignmentForm.maxMarks);
    if (assignmentBriefFile) {
      formData.append('attachment', assignmentBriefFile);
    }

    try {
      const res = await fetch('/api/faculty/assignments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'Assignment created successfully!' });
        setShowAssignmentModal(false);
        fetchAssignments();
      } else {
        alert(data.message || 'Failed to create assignment');
      }
    } catch (err) {
      alert('Error creating assignment');
    }
  };

  // Handle Grade Submission
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradeModal) return;

    try {
      const res = await fetch(
        `/api/faculty/assignments/${gradeModal.assignmentId}/grade/${gradeModal.submission._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            marks: Number(gradeMarks),
            feedback: gradeFeedback,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: 'Submission graded successfully!' });
        setGradeModal(null);
        setGradeMarks('');
        setGradeFeedback('');
        fetchAssignments();
      } else {
        alert(data.message || 'Failed to grade submission');
      }
    } catch (err) {
      alert('Error grading submission');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span>👩‍🏫</span> EduVibe Faculty Portal
        </div>
        <div className="nav-profile">
          <div className="user-pill">
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'F'}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.regNumber || 'Faculty'}</div>
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
            📖 My Subjects & Materials ({courses.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            ✅ Mark Attendance
          </button>
          <button
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            📝 Quizzes ({quizzesList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            📑 Assignments & Grading
          </button>
        </div>

        {/* TAB 1: MY COURSES & MATERIALS */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>My Assigned Subjects</h2>
                <p style={{ color: 'var(--text-muted)' }}>Upload lecture videos, PDF notes, and manage students</p>
              </div>
              <button onClick={() => setShowCourseModal(true)} className="btn btn-primary">
                + Create New Course
              </button>
            </div>

            {courses.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No subjects assigned yet.</p>
                <button onClick={() => setShowCourseModal(true)} className="btn btn-primary">
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="grid-cols-2">
                {courses.map((course) => (
                  <div key={course._id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span className="badge badge-info">{course.code}</span>
                      <span className="badge badge-success">
                        👥 {course.enrolledStudents?.length || 0} Enrolled Students
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      {course.description || 'Department Subject Curriculum.'}
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <button
                        onClick={() => setSelectedCourseForMaterial(course._id)}
                        className="btn btn-primary btn-sm"
                      >
                        📤 Upload Video / PDF
                      </button>
                    </div>

                    {/* Materials List */}
                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Uploaded Resources ({course.materials?.length || 0})
                      </h4>
                      {(!course.materials || course.materials.length === 0) ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>No study materials uploaded yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {course.materials.map((mat, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: 'rgba(15, 23, 42, 0.4)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                              }}
                            >
                              <span>{mat.type === 'video' ? '🎬' : '📄'} {mat.title}</span>
                              <a
                                href={mat.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}
                              >
                                View
                              </a>
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

        {/* TAB 2: MARK ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Mark Daily Attendance</h2>
              <p style={{ color: 'var(--text-muted)' }}>Select subject and date to mark presence of enrolled students</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end' }}>
                <div style={{ minWidth: '250px', flex: 1 }}>
                  <label className="form-label">Select Course / Subject</label>
                  <select
                    className="form-select"
                    value={selectedCourseForAttendance || ''}
                    onChange={(e) => setSelectedCourseForAttendance(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ minWidth: '180px' }}>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>

                <div>
                  <button onClick={handleSaveAttendance} className="btn btn-success" disabled={enrolledStudents.length === 0}>
                    💾 Save Attendance
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Sheet Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Reg Number</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Email</th>
                      <th>Status Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No students enrolled in this course yet. Students can enroll from their Student Portal.
                        </td>
                      </tr>
                    ) : (
                      enrolledStudents.map((st) => {
                        const status = studentStatusMap[st._id] || 'present';
                        return (
                          <tr key={st._id}>
                            <td><span className="badge badge-info">{st.regNumber || 'STU'}</span></td>
                            <td><strong>{st.name}</strong></td>
                            <td>{st.department}</td>
                            <td>{st.email}</td>
                            <td>
                              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatusMap({ ...studentStatusMap, [st._id]: 'present' })}
                                  className={`btn btn-sm ${status === 'present' ? 'btn-success' : 'btn-secondary'}`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentStatusMap({ ...studentStatusMap, [st._id]: 'absent' })}
                                  className={`btn btn-sm ${status === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUIZZES */}
        {activeTab === 'quizzes' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Quiz Management</h2>
                <p style={{ color: 'var(--text-muted)' }}>Build interactive multiple-choice tests with timers</p>
              </div>
              <button
                onClick={() => {
                  setQuizForm({
                    title: '',
                    courseId: courses[0]?._id || '',
                    durationMinutes: 15,
                    questions: [
                      {
                        questionText: '',
                        options: ['', '', '', ''],
                        correctOptionIndex: 0,
                        points: 1,
                      },
                    ],
                  });
                  setShowQuizModal(true);
                }}
                className="btn btn-primary"
                disabled={courses.length === 0}
              >
                + Create New Quiz
              </button>
            </div>

            {quizzesList.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No quizzes created yet.</p>
              </div>
            ) : (
              <div className="grid-cols-2">
                {quizzesList.map((quiz) => (
                  <div key={quiz._id} className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-info">{quiz.course?.code}</span>
                      <span className="badge badge-warning">⏱️ {quiz.durationMinutes} Mins</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{quiz.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Questions: {quiz.questions?.length || 0} | Student Submissions: {quiz.submissions?.length || 0}
                    </p>

                    {quiz.submissions?.length > 0 && (
                      <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <strong>Submissions:</strong>
                        {quiz.submissions.map((sub, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                            <span>Student ID: {sub.student?.toString().slice(-4)}</span>
                            <span style={{ color: '#34d399', fontWeight: 600 }}>{sub.score} / {sub.totalPoints}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS & GRADING */}
        {activeTab === 'assignments' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2>Assignments & Grading</h2>
                <p style={{ color: 'var(--text-muted)' }}>Assign projects and grade student uploaded PDFs</p>
              </div>
              <button
                onClick={() => {
                  setAssignmentForm({
                    title: '',
                    description: '',
                    courseId: courses[0]?._id || '',
                    dueDate: '',
                    maxMarks: 100,
                  });
                  setShowAssignmentModal(true);
                }}
                className="btn btn-primary"
                disabled={courses.length === 0}
              >
                + Post New Assignment
              </button>
            </div>

            {assignmentsList.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>No assignments posted yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {assignmentsList.map((assign) => (
                  <div key={assign._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>{assign.course?.code}</span>
                        <span className="badge badge-danger">Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                        <h3 style={{ fontSize: '1.3rem', marginTop: '0.4rem' }}>{assign.title}</h3>
                      </div>
                      <span className="badge badge-warning">Max Marks: {assign.maxMarks}</span>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {assign.description}
                    </p>

                    {/* Submissions Table */}
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Student PDF Submissions ({assign.submissions?.length || 0})
                    </h4>

                    {(!assign.submissions || assign.submissions.length === 0) ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No student submissions yet.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Student</th>
                              <th>Submitted On</th>
                              <th>PDF File</th>
                              <th>Grade / Marks</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assign.submissions.map((sub) => (
                              <tr key={sub._id}>
                                <td>
                                  <strong>{sub.student?.name || 'Student'}</strong>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub.student?.regNumber}</div>
                                </td>
                                <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                <td>
                                  <a
                                    href={sub.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-sm"
                                  >
                                    📄 Download PDF
                                  </a>
                                </td>
                                <td>
                                  {sub.marks !== null ? (
                                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                                      {sub.marks} / {assign.maxMarks}
                                    </span>
                                  ) : (
                                    <span className="badge badge-warning">Ungraded</span>
                                  )}
                                </td>
                                <td>
                                  <button
                                    onClick={() => {
                                      setGradeModal({ assignmentId: assign._id, submission: sub, maxMarks: assign.maxMarks });
                                      setGradeMarks(sub.marks !== null ? sub.marks : '');
                                      setGradeFeedback(sub.feedback || '');
                                    }}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Grade PDF
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* CREATE COURSE MODAL */}
      {showCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.25rem' }}>Create New Subject / Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  className="form-input"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS402"
                  className="form-input"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Course syllabus summary..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCourseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MATERIAL MODAL (PDF or Video) */}
      {selectedCourseForMaterial && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>Upload Study Material (PDF or Video)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Upload syllabus documents, notes (PDF), or recorded lecture videos (.mp4, .webm).
            </p>

            <form onSubmit={handleUploadMaterial}>
              <div className="form-group">
                <label className="form-label">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 1: System Architecture"
                  className="form-input"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select File (PDF or Video)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.mp4,.webm,.mkv,.mov"
                  className="form-input"
                  onChange={(e) => setMaterialFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setSelectedCourseForMaterial(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={uploadingMaterial} className="btn btn-primary">
                  {uploadingMaterial ? 'Uploading File...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUIZ MODAL */}
      {showQuizModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Create New Multiple-Choice Quiz</h3>
            <form onSubmit={handleSaveQuiz}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1 Midterm Quiz"
                  className="form-input"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={quizForm.courseId}
                    onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value })}
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '140px' }}>
                  <label className="form-label">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={quizForm.durationMinutes}
                    onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Questions</h4>
                {quizForm.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Question {qIdx + 1} Text</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter the question..."
                        className="form-input"
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...quizForm.questions];
                          updated[qIdx].questionText = e.target.value;
                          setQuizForm({ ...quizForm, questions: updated });
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="form-group">
                          <label className="form-label">Option {String.fromCharCode(65 + optIdx)}</label>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${optIdx + 1}`}
                            className="form-input"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...quizForm.questions];
                              updated[qIdx].options[optIdx] = e.target.value;
                              setQuizForm({ ...quizForm, questions: updated });
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Correct Option</label>
                      <select
                        className="form-select"
                        value={q.correctOptionIndex}
                        onChange={(e) => {
                          const updated = [...quizForm.questions];
                          updated[qIdx].correctOptionIndex = Number(e.target.value);
                          setQuizForm({ ...quizForm, questions: updated });
                        }}
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setQuizForm({
                      ...quizForm,
                      questions: [
                        ...quizForm.questions,
                        { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 },
                      ],
                    });
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  + Add Another Question
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowQuizModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.25rem' }}>Post New Assignment</h3>
            <form onSubmit={handleSaveAssignment}>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 2: Database Normalization"
                  className="form-input"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course</label>
                <select
                  className="form-select"
                  value={assignmentForm.courseId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ width: '130px' }}>
                  <label className="form-label">Max Marks</label>
                  <input
                    type="number"
                    className="form-input"
                    value={assignmentForm.maxMarks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions / Description</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Details for students..."
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Assignment Brief Attachment (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="form-input"
                  onChange={(e) => setAssignmentBriefFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE SUBMISSION MODAL */}
      {gradeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>
              Grade Submission: {gradeModal.submission.student?.name}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <a
                href={gradeModal.submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                📄 Open Student PDF in New Tab
              </a>
            </div>

            <form onSubmit={handleSaveGrade}>
              <div className="form-group">
                <label className="form-label">
                  Marks Awarded (out of {gradeModal.maxMarks})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={gradeModal.maxMarks}
                  className="form-input"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Feedback for Student</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Provide constructive feedback..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setGradeModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
