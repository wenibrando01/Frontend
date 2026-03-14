import React, { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Save, X } from "lucide-react";
import api from "../../services/api";
import ConfirmDialog from "../common/ConfirmDialog";

const emptyForm = {
  student_id: "",
  course_id: "",
  semester: "1st Semester",
  school_year: "2025-2026",
  grade: "",
  remarks: "",
};

const EPSILON = 0.001;

const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const compactText = (value) => normalizeText(value).replace(/\s+/g, "");

const digitsOnly = (value) => String(value ?? "").replace(/\D+/g, "");

const getEmailHints = (email) => {
  const normalized = normalizeText(email);
  if (!normalized || !normalized.includes("@")) return [];

  const [localPart, domainPart] = normalized.split("@");
  const domainRoot = String(domainPart || "").split(".")[0];
  const hints = ["email", localPart, domainPart, domainRoot];

  if (domainPart.includes("gmail") || domainPart.includes("googlemail")) {
    hints.push("gmail", "google", "google mail");
  }
  if (domainPart.includes("yahoo") || domainPart.includes("ymail")) {
    hints.push("yahoo", "ymail");
  }
  if (
    domainPart.includes("outlook") ||
    domainPart.includes("hotmail") ||
    domainPart.includes("live")
  ) {
    hints.push("outlook", "hotmail", "live", "microsoft");
  }
  if (domainPart.includes("icloud") || domainPart.includes("me.com") || domainPart.includes("mac.com")) {
    hints.push("icloud", "apple");
  }
  if (domainPart.includes("edu")) {
    hints.push("edu", "school", "student email");
  }

  return hints.map(normalizeText).filter(Boolean);
};

const getStudentFields = (student) => {
  const firstName = String(student?.first_name || "").trim();
  const lastName = String(student?.last_name || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const fallbackName = String(student?.name || "").trim();
  const primaryName = fullName || fallbackName;
  const reversedName = `${lastName} ${firstName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toLowerCase();

  return [
    primaryName,
    fullName,
    fallbackName,
    reversedName,
    initials,
    student?.email,
    student?.username,
    student?.course?.course_name,
    student?.department,
    student?.status,
    student?.id,
    student?.student_id,
    student?.year_level,
    student?.age,
    ...getEmailHints(student?.email),
  ]
    .map(normalizeText)
    .filter(Boolean);
};

const studentMatchScore = (student, query) => {
  const qText = normalizeText(query);
  const qCompact = compactText(query);
  const qDigits = digitsOnly(query);
  if (!qText && !qDigits) return 1;

  const fields = getStudentFields(student);
  if (!fields.length) return 0;

  const joined = fields.join(" ");
  const compactFields = fields.map(compactText).filter(Boolean);
  const compactJoined = compactText(joined);
  if (qText && joined === qText) return 120;
  if (qCompact && compactJoined === qCompact) return 115;
  if (qText && fields.some((f) => f.startsWith(qText))) return 100;
  if (qCompact && compactFields.some((f) => f.startsWith(qCompact))) return 95;
  if (qText && fields.some((f) => f.includes(qText))) return 85;
  if (qCompact && compactFields.some((f) => f.includes(qCompact))) return 80;

  if (qText) {
    const tokens = qText.split(" ").filter(Boolean);
    if (tokens.length > 1) {
      const allTokensMatch = tokens.every((token) => fields.some((f) => f.includes(token)));
      if (allTokensMatch) return 70;
    }
  }

  if (qDigits) {
    const fieldDigits = digitsOnly(joined);
    if (fieldDigits.includes(qDigits)) return 60;
  }

  return 0;
};

function deriveRemarksFromGrade(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n - 1.0) < EPSILON) return "FAILED";
  if (n >= 2.0 && n <= 4.0) return "PASSED";
  if (Math.abs(n - 7.1) < EPSILON || Math.abs(n - 7.2) < EPSILON) return "INC";
  return "";
}

const AdminGrades = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const loadStudentsLookup = async (query = "") => {
    try {
      const res = await api.get("/admin/students", {
        params: {
          per_page: 100,
          search: query.trim() || undefined,
        },
      });

      const rows = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setStudents(rows);
    } catch (err) {
      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("Access denied.");
      else setError(err.response?.data?.message || "Failed to load students.");
      setStudents([]);
    }
  };

  const loadLookups = async () => {
    setError("");
    try {
      const [courseRes] = await Promise.all([
        api.get("/admin/courses", { params: { per_page: 200 } }),
      ]);

      const courseRows = Array.isArray(courseRes.data?.data)
        ? courseRes.data.data
        : Array.isArray(courseRes.data)
        ? courseRes.data
        : [];

      setCourses(courseRows);
      await loadStudentsLookup("");
    } catch (err) {
      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("Access denied.");
      else setError(err.response?.data?.message || "Failed to load students and courses.");
    }
  };

  const loadGrades = async (opts = {}) => {
    const nextPage = Number(opts.page ?? page) || 1;
    const nextPerPage = Number(opts.perPage ?? perPage) || 20;
    const nextSearch = String(opts.search ?? searchQuery).trim();

    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/grades", {
        params: {
          page: nextPage,
          per_page: nextPerPage,
          search: nextSearch || undefined,
        },
      });

      const payload = res.data || {};
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

      setGrades(rows);
      setPage(Number(payload.current_page || nextPage));
      setPerPage(Number(payload.per_page || nextPerPage));
      setTotal(Number(payload.total || rows.length));
      setLastPage(Math.max(1, Number(payload.last_page || 1)));
    } catch (err) {
      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("Access denied.");
      else setError(err.response?.data?.message || "Failed to load grades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadLookups();
      await loadGrades({ page: 1, perPage: 20, search: "" });
    };
    init();
  }, []);

  useEffect(() => {
    const next = searchInput.trim();
    if (next === searchQuery) return;

    const timer = setTimeout(() => {
      setSearchQuery(next);
      loadGrades({ page: 1, perPage, search: next });
    }, 450);

    return () => clearTimeout(timer);
  }, [searchInput, perPage, searchQuery]);

  useEffect(() => {
    if (editingId) return;
    const timer = setTimeout(() => {
      loadStudentsLookup(studentQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [studentQuery, editingId]);

  const resetForm = () => {
    setForm(emptyForm);
    setStudentQuery("");
    setStudentMenuOpen(false);
    setEditingId(null);
  };

  const getStudentLabel = (s) =>
    `${s?.first_name || ""} ${s?.last_name || ""}`.trim() || s?.name || `Student #${s?.id}`;

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "grade") {
      const remarks = deriveRemarksFromGrade(value);
      setForm((prev) => ({ ...prev, grade: value, remarks }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const filteredStudents = students
    .map((s) => ({ s, score: studentMatchScore(s, studentQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.s);

  useEffect(() => {
    if (editingId) return;
    const q = compactText(studentQuery);
    if (!q) return;

    const exactMatches = filteredStudents.filter((s) => {
      const label = compactText(getStudentLabel(s));
      const email = compactText(s?.email || "");
      return label === q || email === q;
    });

    if (exactMatches.length === 1 && String(form.student_id) !== String(exactMatches[0].id)) {
      const s = exactMatches[0];
      setForm((prev) => ({
        ...prev,
        student_id: String(s.id),
        course_id: prev.course_id || String(s.course_id || ""),
      }));
    }
  }, [studentQuery, filteredStudents, editingId, form.student_id]);

  const selectedStudent = students.find((s) => String(s.id) === String(form.student_id));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const studentId = Number(form.student_id);
    if (!Number.isFinite(studentId) || studentId <= 0) {
      setSaving(false);
      setError("Please select a student.");
      return;
    }
    try {
      const payload = {
        student_id: studentId,
        course_id: Number(form.course_id),
        semester: form.semester,
        school_year: form.school_year,
        grade: form.grade === "" ? null : Number(form.grade),
        remarks: deriveRemarksFromGrade(form.grade) || form.remarks || null,
      };

      if (editingId) {
        await api.patch(`/admin/grades/${editingId}`, {
          semester: payload.semester,
          school_year: payload.school_year,
          grade: payload.grade,
          remarks: payload.remarks,
        });
        setMessage("Grade updated successfully.");
      } else {
        await api.post("/admin/grades", payload);
        setMessage("Grade created successfully.");
      }

      resetForm();
      await loadGrades({ page, perPage, search: searchQuery });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save grade.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    const matchedStudent = students.find((s) => Number(s.id) === Number(row.student_id));
    setForm({
      student_id: String(row.student_id || ""),
      course_id: String(row.course_id || ""),
      semester: row.semester || "1st Semester",
      school_year: row.school_year || "2025-2026",
      grade: row.grade ?? "",
      remarks: deriveRemarksFromGrade(row.grade) || row.remarks || "",
    });
    setStudentQuery(matchedStudent ? getStudentLabel(matchedStudent) : String(row.student_name || ""));
    setStudentMenuOpen(false);
    setError("");
    setMessage("");
  };

  const onDelete = async (id) => {
    setError("");
    setMessage("");
    try {
      await api.delete(`/admin/grades/${id}`);
      setMessage("Grade deleted.");
      await loadGrades({ page, perPage, search: searchQuery });
      setDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete grade.");
    }
  };

  const onResetSearch = async () => {
    setSearchInput("");
    setSearchQuery("");
    await loadGrades({ page: 1, perPage, search: "" });
  };

  const onPerPageChange = async (value) => {
    const nextPerPage = Number(value) || 20;
    setPerPage(nextPerPage);
    await loadGrades({ page: 1, perPage: nextPerPage, search: searchQuery });
  };

  const onPrev = async () => {
    if (page <= 1) return;
    await loadGrades({ page: page - 1, perPage, search: searchQuery });
  };

  const onNext = async () => {
    if (page >= lastPage) return;
    await loadGrades({ page: page + 1, perPage, search: searchQuery });
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Grades</h1>
      </div>

      <p className="admin-muted" style={{ marginBottom: 12 }}>
        Publish and manage student grades by semester.
      </p>

      {message && <div className="admin-pill success">{message}</div>}
      {error && <div className="admin-pill warn">{error}</div>}

      <div className="cardx" style={{ marginBottom: 14, overflow: "visible" }}>
        <div className="cardx-body" style={{ overflow: "visible" }}>
          <form onSubmit={onSubmit} className="admin-form-grid" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div style={{ position: "relative", gridColumn: "span 2", zIndex: 30 }}>
              <input
                className="admin-input"
                value={studentQuery}
                onChange={(e) => {
                  setStudentQuery(e.target.value);
                  setStudentMenuOpen(true);
                  if (form.student_id) {
                    setForm((prev) => ({ ...prev, student_id: "" }));
                  }
                }}
                onFocus={() => setStudentMenuOpen(true)}
                onBlur={() => setTimeout(() => setStudentMenuOpen(false), 120)}
                placeholder="Search and select student..."
                disabled={Boolean(editingId)}
              />

              {!editingId && studentMenuOpen && (
                <div
                  className="student-picker-menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    maxHeight: 220,
                    overflowY: "auto",
                    padding: 6,
                  }}
                >
                  {filteredStudents.length === 0 ? (
                    <div className="admin-muted" style={{ padding: "6px 8px" }}>No matching students.</div>
                  ) : (
                    filteredStudents.slice(0, 80).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="student-picker-option"
                        style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const label = getStudentLabel(s);
                          setStudentQuery(label);
                          setStudentMenuOpen(false);
                          setForm((prev) => ({
                            ...prev,
                            student_id: String(s.id),
                            course_id: prev.course_id || String(s.course_id || ""),
                          }));
                        }}
                      >
                        {getStudentLabel(s)}
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="admin-muted" style={{ marginTop: 6, minHeight: 18 }}>
                {selectedStudent ? `Selected: ${getStudentLabel(selectedStudent)}` : "No student selected"}
              </div>
            </div>

            <select className="admin-input" name="course_id" value={form.course_id} onChange={onChange} required disabled={Boolean(editingId)}>
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.course_name}</option>
              ))}
            </select>

            <select className="admin-input" name="semester" value={form.semester} onChange={onChange} required>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>

            <input
              className="admin-input"
              name="school_year"
              value={form.school_year}
              onChange={onChange}
              placeholder="2025-2026"
              required
            />

            <input
              className="admin-input"
              name="grade"
              type="number"
              min="1"
              max="7.2"
              step="0.1"
              value={form.grade}
              onChange={onChange}
              placeholder="1, 2-4, 7.1, 7.2"
            />

            <input
              className="admin-input"
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              placeholder="Auto: PASSED / FAILED / INC"
              readOnly
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button className="admin-btn primary" type="submit" disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              {editingId && (
                <button className="admin-btn" type="button" onClick={resetForm}>
                  <X size={16} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div className="admin-search-wrap" style={{ maxWidth: 340 }}>
          <Search size={18} />
          <input
            type="search"
            className="admin-input"
            placeholder="Search grades..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <button className="admin-btn" type="button" onClick={onResetSearch}>Reset</button>

        <select className="admin-input" style={{ maxWidth: 140 }} value={perPage} onChange={(e) => onPerPageChange(e.target.value)}>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 260 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Semester</th>
                <th>School Year</th>
                <th>Grade</th>
                <th>Remarks</th>
                <th className="admin-table-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={7}>No grade records found.</td>
                </tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.id}>
                    <td>{`${g.student?.first_name || ""} ${g.student?.last_name || ""}`.trim() || g.student?.name || "-"}</td>
                    <td>{g.course?.course_name || "-"}</td>
                    <td>{g.semester || "-"}</td>
                    <td>{g.school_year || "-"}</td>
                    <td>{g.grade ?? "-"}</td>
                    <td>{g.remarks || "-"}</td>
                    <td className="admin-table-col-actions">
                      <div className="admin-table-actions">
                        <button className="admin-btn icon" type="button" onClick={() => startEdit(g)} aria-label="Edit grade">
                          <Pencil size={14} />
                        </button>
                        <button className="admin-btn icon danger" type="button" onClick={() => setDeleteId(g.id)} aria-label="Delete grade">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
        <p className="admin-muted" style={{ margin: 0 }}>
          Showing {grades.length} of {total} records {searchQuery ? `for "${searchQuery}"` : ""}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="admin-btn" type="button" onClick={onPrev} disabled={loading || page <= 1}>Prev</button>
          <span className="admin-muted">Page {page} of {lastPage}</span>
          <button className="admin-btn" type="button" onClick={onNext} disabled={loading || page >= lastPage}>Next</button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Grade Record"
        message="This action cannot be undone."
        meta="The selected grade record will be removed permanently."
        confirmText="Delete"
        onConfirm={() => onDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminGrades;
