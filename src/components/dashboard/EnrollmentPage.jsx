import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const SUBJECTS_BY_CODE = {
  BSIT: [
    "Introduction to Computing",
    "Programming Fundamentals",
    "Object-Oriented Programming",
    "Data Structures and Algorithms",
    "Database Management Systems",
    "Web Development",
    "Software Engineering",
    "Operating Systems",
    "Computer Networks",
    "Information Security",
    "Human Computer Interaction",
    "System Analysis and Design",
    "Mobile Application Development",
    "Cloud Computing",
    "Artificial Intelligence Fundamentals",
    "IT Project Management",
    "Research Methods in IT",
    "IT Elective",
    "Capstone Project 1",
    "Capstone Project 2",
  ],
  BSCS: [
    "Discrete Mathematics",
    "Programming 1",
    "Programming 2",
    "Algorithms and Complexity",
    "Data Structures",
    "Computer Organization",
    "Operating Systems",
    "Database Systems",
    "Artificial Intelligence",
    "Machine Learning",
    "Computer Graphics",
    "Automata Theory",
    "Software Engineering",
    "Computer Networks",
    "Distributed Systems",
    "Parallel Computing",
    "Research Methods",
    "CS Elective",
    "Thesis 1",
    "Thesis 2",
  ],
  BSCpE: [
    "Engineering Mathematics 1",
    "Engineering Mathematics 2",
    "Digital Logic Design",
    "Computer Programming",
    "Data Structures",
    "Computer Organization",
    "Microprocessors",
    "Embedded Systems",
    "Circuit Analysis",
    "Electronics Fundamentals",
    "Signals and Systems",
    "Computer Networks",
    "Operating Systems",
    "Robotics",
    "Control Systems",
    "VLSI Design",
    "Engineering Research",
    "CpE Elective",
    "Capstone Design 1",
    "Capstone Design 2",
  ],
  BSEE: [
    "Engineering Mathematics 1",
    "Engineering Mathematics 2",
    "Physics for Engineers",
    "Circuit Analysis 1",
    "Circuit Analysis 2",
    "Electrical Machines",
    "Power Systems",
    "Control Systems",
    "Electromagnetics",
    "Electrical Measurements",
    "Power Electronics",
    "Renewable Energy Systems",
    "Engineering Economics",
    "Electrical Design",
    "Industrial Automation",
    "Power Distribution",
    "Engineering Research",
    "EE Elective",
    "Capstone Design 1",
    "Capstone Design 2",
  ],
  BSECE: [
    "Engineering Mathematics",
    "Electronic Devices",
    "Circuit Analysis",
    "Digital Electronics",
    "Analog Electronics",
    "Signals and Systems",
    "Communication Systems",
    "Microprocessors",
    "Embedded Systems",
    "Control Systems",
    "Antenna and Wave Propagation",
    "Industrial Electronics",
    "Data Communications",
    "Electronic Design",
    "Robotics",
    "VLSI Design",
    "Engineering Research",
    "ECE Elective",
    "Capstone Project 1",
    "Capstone Project 2",
  ],
  BSCRIM: [
    "Introduction to Criminology",
    "Criminal Law 1",
    "Criminal Law 2",
    "Human Behavior and Crisis Management",
    "Police Organization and Administration",
    "Criminal Investigation",
    "Forensic Science",
    "Criminalistics",
    "Traffic Management",
    "Law Enforcement Operations",
    "Correctional Administration",
    "Criminal Sociology",
    "Ethics and Values",
    "Juvenile Delinquency",
    "Victimology",
    "Crime Prevention",
    "Research Methods in Criminology",
    "Criminology Elective",
    "Internship",
    "Criminology Capstone",
  ],
  BSA: [
    "Financial Accounting 1",
    "Financial Accounting 2",
    "Managerial Accounting",
    "Cost Accounting",
    "Auditing Principles",
    "Taxation",
    "Accounting Information Systems",
    "Advanced Accounting",
    "Business Law",
    "Economics",
    "Financial Management",
    "Accounting Theory",
    "Government Accounting",
    "Forensic Accounting",
    "Accounting Research",
    "Risk Management",
    "Professional Ethics",
    "Accountancy Elective",
    "Internship",
    "Accountancy Capstone",
  ],
  BSFM: [
    "Principles of Finance",
    "Financial Accounting",
    "Managerial Accounting",
    "Business Statistics",
    "Investment Management",
    "Financial Markets",
    "Risk Management",
    "Corporate Finance",
    "Banking and Financial Institutions",
    "Portfolio Management",
    "Financial Planning",
    "International Finance",
    "Financial Analysis",
    "Business Law",
    "Economics",
    "Strategic Management",
    "Research Methods",
    "Finance Elective",
    "Internship",
    "Finance Capstone",
  ],
  BSMM: [
    "Principles of Marketing",
    "Consumer Behavior",
    "Advertising",
    "Sales Management",
    "Retail Management",
    "Digital Marketing",
    "Brand Management",
    "Marketing Research",
    "International Marketing",
    "Product Management",
    "Pricing Strategies",
    "Marketing Analytics",
    "Business Communication",
    "Entrepreneurship",
    "Business Law",
    "Strategic Marketing",
    "Research Methods",
    "Marketing Elective",
    "Internship",
    "Marketing Capstone",
  ],
  BSHRM: [
    "Principles of Management",
    "Human Resource Management",
    "Recruitment and Selection",
    "Training and Development",
    "Compensation Management",
    "Labor Relations",
    "Organizational Behavior",
    "Performance Management",
    "Strategic HRM",
    "HR Information Systems",
    "Leadership Development",
    "Workplace Ethics",
    "Business Communication",
    "Employment Law",
    "Organizational Development",
    "Conflict Management",
    "Research Methods",
    "HR Elective",
    "Internship",
    "HR Capstone",
  ],
  BSIA: [
    "Principles of Auditing",
    "Internal Control Systems",
    "Risk Management",
    "Financial Accounting",
    "Managerial Accounting",
    "Forensic Auditing",
    "IT Auditing",
    "Fraud Examination",
    "Compliance Auditing",
    "Corporate Governance",
    "Business Law",
    "Financial Analysis",
    "Audit Reporting",
    "Professional Ethics",
    "Cost Accounting",
    "Strategic Auditing",
    "Research Methods",
    "Audit Elective",
    "Internship",
    "Audit Capstone",
  ],
  BSMA: [
    "Financial Accounting",
    "Managerial Accounting",
    "Cost Accounting",
    "Budgeting",
    "Financial Management",
    "Strategic Cost Management",
    "Performance Management",
    "Accounting Information Systems",
    "Business Statistics",
    "Economics",
    "Business Law",
    "Corporate Governance",
    "Risk Management",
    "Financial Analysis",
    "Professional Ethics",
    "Taxation",
    "Research Methods",
    "Accounting Elective",
    "Internship",
    "Accounting Capstone",
  ],
  BSHM: [
    "Introduction to Hospitality",
    "Food and Beverage Service",
    "Housekeeping Operations",
    "Front Office Operations",
    "Culinary Fundamentals",
    "Hospitality Marketing",
    "Tourism Geography",
    "Event Management",
    "Hospitality Accounting",
    "Hotel Management",
    "Restaurant Management",
    "Customer Service Excellence",
    "Hospitality Law",
    "Food Safety and Sanitation",
    "Beverage Management",
    "Resort Management",
    "Research Methods",
    "Hospitality Elective",
    "Internship",
    "Hospitality Capstone",
  ],
  BSTM: [
    "Introduction to Tourism",
    "Tourism Geography",
    "Travel Agency Operations",
    "Tour Planning and Development",
    "Sustainable Tourism",
    "Tourism Marketing",
    "Airline Operations",
    "Event Planning",
    "Cultural Tourism",
    "Ecotourism",
    "Tourism Law",
    "Hospitality Management",
    "Tourism Economics",
    "Customer Service",
    "Destination Management",
    "Global Tourism Trends",
    "Research Methods",
    "Tourism Elective",
    "Internship",
    "Tourism Capstone",
  ],
  BSP: [
    "General Psychology",
    "Developmental Psychology",
    "Abnormal Psychology",
    "Cognitive Psychology",
    "Social Psychology",
    "Biological Psychology",
    "Psychological Assessment",
    "Research Methods in Psychology",
    "Statistics for Psychology",
    "Counseling Psychology",
    "Industrial Psychology",
    "Clinical Psychology",
    "Personality Psychology",
    "Behavioral Neuroscience",
    "Educational Psychology",
    "Community Psychology",
    "Psychological Ethics",
    "Psychology Elective",
    "Practicum",
    "Psychology Thesis",
  ],
  ABEL: [
    "Introduction to Linguistics",
    "English Grammar",
    "Phonetics and Phonology",
    "Morphology",
    "Syntax",
    "Semantics",
    "Literature in English",
    "World Literature",
    "Creative Writing",
    "Academic Writing",
    "Technical Writing",
    "Discourse Analysis",
    "Sociolinguistics",
    "Language Teaching Methods",
    "Translation Studies",
    "Literary Criticism",
    "Research Methods",
    "English Elective",
    "Practicum",
    "Thesis",
  ],
  BEED: [
    "Child Development",
    "Principles of Teaching",
    "Curriculum Development",
    "Assessment of Learning",
    "Teaching Mathematics in Elementary",
    "Teaching English in Elementary",
    "Teaching Science in Elementary",
    "Teaching Social Studies",
    "Classroom Management",
    "Educational Technology",
    "Inclusive Education",
    "Reading Instruction",
    "Values Education",
    "Educational Psychology",
    "Teaching Strategies",
    "Lesson Planning",
    "Research in Education",
    "Education Elective",
    "Practice Teaching 1",
    "Practice Teaching 2",
  ],
  BSEDENG: [
    "English Grammar",
    "Literature in English",
    "World Literature",
    "Linguistics",
    "Phonetics and Phonology",
    "Teaching English Methods",
    "Curriculum Development",
    "Assessment of Learning",
    "Classroom Management",
    "Educational Technology",
    "Creative Writing",
    "Academic Writing",
    "Language Teaching Strategies",
    "Sociolinguistics",
    "Discourse Analysis",
    "Educational Psychology",
    "Research in Education",
    "English Education Elective",
    "Practice Teaching 1",
    "Practice Teaching 2",
  ],
  BSEDMATH: [
    "College Algebra",
    "Trigonometry",
    "Calculus 1",
    "Calculus 2",
    "Linear Algebra",
    "Differential Equations",
    "Probability and Statistics",
    "Geometry",
    "Mathematical Modeling",
    "Number Theory",
    "Teaching Mathematics Methods",
    "Curriculum Development",
    "Assessment of Learning",
    "Classroom Management",
    "Educational Technology",
    "Educational Psychology",
    "Research in Mathematics Education",
    "Mathematics Elective",
    "Practice Teaching 1",
    "Practice Teaching 2",
  ],
  BPE: [
    "Foundations of Physical Education",
    "Human Anatomy and Physiology",
    "Fitness and Wellness",
    "Sports Psychology",
    "Coaching Principles",
    "Team Sports",
    "Individual Sports",
    "Dance and Rhythmic Activities",
    "Physical Fitness Assessment",
    "Sports Officiating",
    "Sports Management",
    "Adapted Physical Education",
    "Recreation and Leisure",
    "Exercise Physiology",
    "Motor Learning",
    "Health Education",
    "Research in Physical Education",
    "PE Elective",
    "Practicum",
    "PE Capstone",
  ],
};

const DAYS = ["Mon/Wed", "Tue/Thu", "Fri", "Sat"];
const MORNING_TIMES = ["07:30-09:00", "09:00-10:30", "10:30-12:00"];
const AFTERNOON_TIMES = ["13:00-14:30", "14:30-16:00", "16:00-17:30"];
const MINOR_UNITS = 3;
const MAJOR_UNITS = 4;
const MAX_ENROLL_UNITS = 28;

const MINOR_SUBJECT_TITLES = [
  "business communication",
  "business law",
  "economics",
  "entrepreneurship",
  "professional ethics",
  "psychological ethics",
  "workplace ethics",
  "research methods",
  "research methods in it",
  "research methods in psychology",
  "research methods in criminology",
  "research in education",
  "research in mathematics education",
  "research in physical education",
  "engineering research",
  "statistics for psychology",
  "business statistics",
  "probability and statistics",
  "values education",
  "general psychology",
];

function isMinorSubject(subjectName) {
  const value = String(subjectName || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return MINOR_SUBJECT_TITLES.includes(value);
}

function unitsForSubject(subjectName) {
  return isMinorSubject(subjectName) ? MINOR_UNITS : MAJOR_UNITS;
}

function normalizeSubjectKeyPart(subjectName) {
  return String(subjectName || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildScheduleForIndex(index) {
  const day = DAYS[index % DAYS.length];
  const morning = MORNING_TIMES[index % MORNING_TIMES.length];
  const afternoon = AFTERNOON_TIMES[index % AFTERNOON_TIMES.length];
  return {
    morning: `${day} ${morning}`,
    afternoon: `${day} ${afternoon}`,
  };
}

function normalizeToTwenty(subjects = []) {
  const base = subjects.slice(0, 20);
  while (base.length < 20) {
    base.push(`Subject Elective ${base.length + 1}`);
  }
  return base;
}

function generateSubjectCode(courseId, subjectName, index = 0) {
  const seed = `${courseId || 0}:${subjectName || ""}:${index}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return String((hash % 900000) + 100000);
}

const EnrollmentPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [primaryCourseId, setPrimaryCourseId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [sessionBySubjectKey, setSessionBySubjectKey] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSubjectKey, setSavingSubjectKey] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [coursesRes, enrollmentsRes, profileRes] = await Promise.all([
        api.get("/courses"),
        api.get("/student/enrollments"),
        api.get("/student/profile"),
      ]);
      const cRaw = coursesRes.data;
      const eRaw = enrollmentsRes.data;
      const pRaw = profileRes.data;
      const cRows = Array.isArray(cRaw?.data) ? cRaw.data : Array.isArray(cRaw) ? cRaw : [];
      const eRows = Array.isArray(eRaw?.data) ? eRaw.data : Array.isArray(eRaw) ? eRaw : [];
      setCourses(cRows);
      setEnrollments(eRows);
      setPrimaryCourseId(pRaw?.course_id || null);
      if (!selectedCourseId && cRows[0]?.id) {
        setSelectedCourseId(cRows[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load enrollment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!courseId) {
      setSelectedCourseId(null);
      return;
    }
    const parsed = Number(courseId);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setSelectedCourseId(parsed);
    }
  }, [courseId]);

  const enrollmentMap = useMemo(() => {
    const map = new Map();
    enrollments.forEach((row) => {
      const subjectName = row.subject_name || row.course?.course_name || "";
      const key = `${row.course_id}::${normalizeSubjectKeyPart(subjectName)}`;
      if (!map.has(key)) map.set(key, row);
    });
    return map;
  }, [enrollments]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const isSubjectView = Boolean(courseId);

  const selectedCourseSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    const byCode = SUBJECTS_BY_CODE[selectedCourse.course_code] || [];
    return normalizeToTwenty(byCode).map((subjectName, idx) => ({
      id: `${selectedCourse.id}-${idx + 1}`,
      subject_code: generateSubjectCode(selectedCourse.id, subjectName, idx + 1),
      subject_name: subjectName,
      schedule: buildScheduleForIndex(idx),
    }));
  }, [selectedCourse]);

  const enrolledCount = enrollments.filter((e) => !!e.subject_name).length;
  const enrolledUnits = enrollments
    .filter((e) => !!e.subject_name)
    .reduce((sum, e) => sum + unitsForSubject(e.subject_name), 0);

  const getSubjectKey = (courseId, subjectName) => `${courseId}::${normalizeSubjectKeyPart(subjectName)}`;

  const getPreferredSession = (courseId, subjectName) => {
    const key = getSubjectKey(courseId, subjectName);
    return sessionBySubjectKey[key] || "morning";
  };

  const updatePreferredSession = (courseId, subjectName, session) => {
    const key = getSubjectKey(courseId, subjectName);
    setSessionBySubjectKey((prev) => ({ ...prev, [key]: session }));
  };

  const enrollNow = async (course, subjectName, schedule) => {
    const subjectKey = getSubjectKey(course.id, subjectName);
    const preferredSession = getPreferredSession(course.id, subjectName);
    const scheduleLabel = preferredSession === "morning" ? schedule.morning : schedule.afternoon;

    setSavingSubjectKey(subjectKey);
    setError("");
    setMessage("");
    try {
      await api.post("/student/enrollments", {
        course_id: Number(course.id),
        subject_name: subjectName,
        preferred_session: preferredSession,
        schedule_label: scheduleLabel,
      });

      try {
        localStorage.setItem(
          "my_courses_flash",
          JSON.stringify({
            type: "success",
            message: `Enrolled in ${subjectName} (${preferredSession}) successfully.`,
            at: Date.now(),
          })
        );
      } catch {
        // Ignore storage failures and continue normal flow.
      }

      setMessage("Enrollment request submitted successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll.");
    } finally {
      setSavingSubjectKey(null);
    }
  };

  if (loading) return <div className="educo-content"><div className="skeleton skeleton-block" /></div>;

  return (
    <div className="educo-content">
      <div className="cardx">
        <div className="cardx-header">
          <div>
            <div className="cardx-title">Enrollment</div>
            <div className="cardx-description muted">Course to subjects to schedule enrollment flow.</div>
          </div>
        </div>
        <div className="cardx-body">
          {message && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <div className="pill success">{message}</div>
              <button className="button" type="button" onClick={() => navigate("/dashboard/my-courses")}>
                View what I enrolled
              </button>
            </div>
          )}
          {error && <div className="pill warn" style={{ marginBottom: 10 }}>{error}</div>}

          <p className="muted" style={{ marginBottom: 12 }}>
            Enrolled subjects: {enrolledCount} | Units: {enrolledUnits}/{MAX_ENROLL_UNITS}
          </p>

          {courses.length === 0 ? (
            <p className="muted">No courses available.</p>
          ) : (
            <>
              {!isSubjectView && (
                <div className="admin-table-wrap" style={{ marginBottom: 14 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Code</th>
                      <th>Department</th>
                      <th>Subjects</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => {
                      const isSelected = selectedCourseId === course.id;
                      const isPrimary = primaryCourseId === course.id;
                      const totalSubjects = normalizeToTwenty(SUBJECTS_BY_CODE[course.course_code] || []).length;
                      return (
                        <tr key={course.id}>
                          <td>
                            {course.course_name || "-"}
                            {isPrimary ? " (My Course)" : ""}
                          </td>
                          <td>{course.course_code || "-"}</td>
                          <td>{course.department || "-"}</td>
                          <td>{totalSubjects}</td>
                          <td>
                            <button
                              className="button primary"
                              type="button"
                              onClick={() => navigate(`/dashboard/enrollment/subjects/${course.id}`)}
                            >
                              {isSelected ? "Viewing" : "View subjects"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              )}

              {isSubjectView && selectedCourse && (
                <div className="cardx" style={{ boxShadow: "none" }}>
                  <div className="cardx-header" style={{ paddingBottom: 0 }}>
                    <div>
                      <div className="cardx-title">{selectedCourse.course_name} Subjects</div>
                      <div className="cardx-description muted">Choose a session and enlist per subject.</div>
                      {selectedCourse.id !== primaryCourseId && (
                        <div className="cardx-description muted">Only minor subjects can be enrolled from non-primary courses.</div>
                      )}
                      <div style={{ marginTop: 10 }}>
                        <button className="button" type="button" onClick={() => navigate("/dashboard/enrollment")}>
                          Back to courses
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="cardx-body" style={{ paddingTop: 10 }}>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Subject Code</th>
                            <th>Subject</th>
                            <th>Units</th>
                            <th>Morning Schedule</th>
                            <th>Afternoon Schedule</th>
                            <th>Session</th>
                            <th>Status</th>
                            <th>Enrolled On</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCourseSubjects.map((row) => {
                            const subjectKey = getSubjectKey(selectedCourse.id, row.subject_name);
                            const enrollment = enrollmentMap.get(subjectKey);
                            const isEnrolled = Boolean(enrollment);
                            const isSaving = savingSubjectKey === subjectKey;
                            const inPrimaryCourse = selectedCourse.id === primaryCourseId;
                            const isMinor = isMinorSubject(row.subject_name);
                            const isEligible = inPrimaryCourse || isMinor;
                            const subjectUnits = unitsForSubject(row.subject_name);
                            const wouldExceedUnits = !isEnrolled && enrolledUnits + subjectUnits > MAX_ENROLL_UNITS;

                            return (
                              <tr key={row.id}>
                                <td>{row.subject_code}</td>
                                <td>{row.subject_name}</td>
                                <td>{subjectUnits}</td>
                                <td>{row.schedule.morning}</td>
                                <td>{row.schedule.afternoon}</td>
                                <td>
                                  <select
                                    className="educo-input"
                                    value={getPreferredSession(selectedCourse.id, row.subject_name)}
                                    disabled={isEnrolled || !isEligible}
                                    onChange={(e) => updatePreferredSession(selectedCourse.id, row.subject_name, e.target.value)}
                                    style={{ minWidth: 120 }}
                                  >
                                    <option value="morning">Morning</option>
                                    <option value="afternoon">Afternoon</option>
                                  </select>
                                </td>
                                <td>
                                  {isEnrolled
                                    ? "Enrolled"
                                    : wouldExceedUnits
                                    ? "Unit limit"
                                    : !isEligible
                                    ? "Major only"
                                    : inPrimaryCourse
                                    ? "Major"
                                    : "Minor"}
                                </td>
                                <td>{enrollment?.enrolled_on ? new Date(enrollment.enrolled_on).toLocaleDateString() : "-"}</td>
                                <td>
                                  <button
                                    className="button primary"
                                    type="button"
                                    disabled={isEnrolled || isSaving || !isEligible || wouldExceedUnits}
                                    onClick={() => enrollNow(selectedCourse, row.subject_name, row.schedule)}
                                  >
                                    {isEnrolled
                                      ? "Enrolled"
                                      : wouldExceedUnits
                                      ? "Unit limit"
                                      : !isEligible
                                      ? "Major only"
                                      : isSaving
                                      ? "Submitting..."
                                      : "Enroll"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {isSubjectView && !selectedCourse && !loading && (
                <div className="pill warn">Selected course not found.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;
