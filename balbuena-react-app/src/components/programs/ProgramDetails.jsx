import React from 'react';
import Card from '../ui/Card';

const BSIT_PLAN = [
  {
    term: '1st Year / 1st Sem',
    rows: [
      { grade: '2.5', code: 'GE 4', units: 3.0, title: 'MATHEMATICS IN THE MODERN WORLD', desc: '', req: '' },
      { grade: '2.5', code: 'GE 3', units: 3.0, title: 'THE CONTEMPORARY WORLD', desc: '', req: '' },
      {
        grade: '3.5',
        code: 'GE 2',
        units: 6.0,
        title: 'PURPOSIVE COMMUNICATION W/ INTERACTIVE LEARNI',
        desc: '',
        req: '',
      },
      { grade: '3.5', code: 'GE 15', units: 3.0, title: 'ENVIRONMENTAL SCIENCE', desc: '', req: '' },
      { grade: '3.5', code: 'CCE 101', units: 3.0, title: 'INTRODUCTION TO COMPUTING', desc: '', req: '' },
      { grade: '2.5', code: 'CCE 102/L', units: 3.0, title: 'COMPUTER PROGRAMMING 1 (2ndT)', desc: '', req: '' },
      { grade: '3.0', code: 'PAHF 1', units: 2.0, title: 'MOVEMENT COMPETENCY TRAINING', desc: '', req: '' },
      { grade: '3.5', code: 'NSTP 1', units: 3.0, title: 'NATIONAL SERVICE TRAINING PROGRAM 1', desc: '', req: '' },
    ],
  },
  {
    term: '1st Year / 2nd Sem',
    rows: [
      { grade: '2.5', code: 'GE 8', units: 3.0, title: 'READINGS IN PHILIPPINE HISTORY', desc: '', req: '' },
      {
        grade: '3.0',
        code: 'UGE 1',
        units: 6.0,
        title: 'READING COMPREHENSION',
        desc: '',
        req: 'GE 2',
      },
      { grade: '3.0', code: 'IT 1a', units: 3.0, title: 'IT ELECTIVE 1', desc: '', req: 'CCE 101/L' },
      { grade: '2.5', code: 'CCE 103', units: 3.0, title: 'COMPUTER PROGRAMMING 2', desc: '', req: 'CCE 102/L' },
      { grade: '2.0', code: 'IT 2', units: 3.0, title: 'DISCRETE MATHEMATICS', desc: '', req: '' },
      { grade: '3.5', code: 'GE 1', units: 3.0, title: 'UNDERSTANDING THE SELF', desc: '', req: '' },
      { grade: '4.0', code: 'PAHF 2', units: 2.0, title: 'EXERCISE-BASED FITNESS ACTIVITIES', desc: '', req: 'PAHF 1' },
      { grade: '3.5', code: 'NSTP 2', units: 3.0, title: 'NATIONAL SERVICE TRAINING PROGRAM 2', desc: '', req: 'NSTP 1' },
    ],
  },
  {
    term: '2nd Year / 1st Sem',
    rows: [
      { grade: '3.5', code: 'GE 7', units: 3.0, title: 'ART APPRECIATION', desc: '', req: '' },
      { grade: '3.0', code: 'CCE 104/L', units: 3.0, title: 'INFORMATION MANAGEMENT', desc: '', req: 'CCE 101/L' },
      {
        grade: '2.5',
        code: 'CCE 105',
        units: 3.0,
        title: 'DATA STRUCTURES AND ALGORITHMS',
        desc: '',
        req: 'CCE 103/L',
      },
      { grade: '3.0', code: 'IT 3/L', units: 3.0, title: 'NETWORKING 1', desc: '', req: 'IT 1a/L' },
      { grade: '3.0', code: 'MTH 103', units: 3.0, title: 'PROBABILITIES AND STATISTICS', desc: '', req: 'IT 2' },
      { grade: '3.5', code: 'IT 4', units: 3.0, title: 'CALCULUS 1', desc: '', req: 'IT 2' },
      { grade: '2.5', code: 'IT 5', units: 3.0, title: 'IT ELECTIVE 2', desc: '', req: 'CCE 103/L' },
      { grade: '3.5', code: 'PAHF 3', units: 2.0, title: 'DANCE AND SPORTS 1', desc: '', req: 'PAHF 2' },
    ],
  },
  {
    term: '2nd Year / 2nd Sem',
    rows: [
      {
        grade: '2.0',
        code: 'IT 6',
        units: 3.0,
        title: 'FUNDAMENTALS OF DATABASE SYSTEMS',
        desc: '',
        req: 'CCE 104/L',
      },
      {
        grade: '3.0',
        code: 'IT 7/L',
        units: 3.0,
        title: 'INTRODUCTION TO HUMAN COMPUTER INTERACTION',
        desc: '',
        req: 'CCE 103/L, IT 5/L',
      },
      { grade: '3.0', code: 'IT 8', units: 3.0, title: 'CALCULUS 2', desc: '', req: 'IT 4' },
      { grade: '3.0', code: 'GE 6', units: 3.0, title: "RIZAL'S LIFE AND WORKS", desc: '', req: '' },
      {
        grade: '2.5',
        code: 'IT 9a',
        units: 6.0,
        title: 'PROFESSIONAL TRACK FOR IT 3',
        desc: '',
        req: 'CCE 104/L',
      },
      { grade: '3.0', code: 'GE 5', units: 3.0, title: 'SCIENCE, TECHNOLOGY, AND SOCIETY', desc: '', req: '' },
      { grade: '3.5', code: 'PAHF 4', units: 2.0, title: 'DANCE AND SPORTS 2', desc: '', req: 'PAHF 3' },
    ],
  },
  {
    term: '3rd Year / 1st Sem',
    rows: [
      { grade: '3.0', code: 'IT 11', units: 3.0, title: 'NETWORKING 2', desc: '', req: 'IT 3/L, IT 9a/L' },
      {
        grade: '3.0',
        code: 'IT 12/L',
        units: 3.0,
        title: 'SYSTEMS INTEGRATION & ARCHITECTURE',
        desc: '',
        req: 'IT 6/L',
      },
      { grade: '3.5', code: 'IT 13', units: 3.0, title: 'PROFESSIONAL TRACK FOR IT 4', desc: '', req: 'IT 6/L' },
      { grade: '2.0', code: 'PHYS 101', units: 4.0, title: 'COLLEGE PHYSICS 1', desc: '', req: 'IT 2' },
      { grade: '4.0', code: 'GE 11', units: 3.0, title: 'THE ENTREPRENEURIAL MIND', desc: '', req: '' },
      {
        grade: '3.5',
        code: 'IT 10/L',
        units: 3.0,
        title: 'IT ELECTIVE 3',
        desc: '',
        req: 'CCE 104/L, IT 5/L',
      },
      { grade: '2.0', code: 'IT 14', units: 3.0, title: 'PROFESSIONAL TRACK FOR IT 5', desc: '', req: 'IT 6/L' },
      {
        grade: '3.0',
        code: 'CCE 106/L',
        units: 3.0,
        title: 'APPLICATION DEVELOPMENT AND EMERGING TECHNOLOGIES',
        desc: '',
        req: 'IT 9a/L',
      },
    ],
  },
  {
    term: '3rd Year / 2nd Sem',
    rows: [
      { grade: '', code: 'IT 15', units: 3.0, title: 'INTEGRATIVE PROGRAMMING AND TECHNOLOGIES', desc: '', req: 'IT 11/L' },
      { grade: '', code: 'IT 16', units: 3.0, title: 'INFORMATION ASSURANCE AND SECURITY 1', desc: '', req: 'IT 11/L' },
      {
        grade: '',
        code: 'UGE 2',
        units: 3.0,
        title: 'TECHNICAL WRITING IN THE DISCIPLINE',
        desc: '',
        req: 'UGE 1',
      },
      { grade: '', code: 'IT 18', units: 3.0, title: 'QUANTITATIVE METHODS', desc: '', req: 'MTH 103/L' },
      { grade: '', code: 'PHYS 102', units: 4.0, title: 'COLLEGE PHYSICS 2', desc: '', req: 'PHYS 101/L' },
      { grade: '', code: 'IT 19/L', units: 3.0, title: 'TECHNOPRENEURSHIP', desc: '', req: 'GE 11, IT 12/L' },
      { grade: '', code: 'IT 17', units: 3.0, title: 'SOCIAL AND PROFESSIONAL ISSUES', desc: '', req: '' },
      { grade: '', code: 'IT 20/L', units: 3.0, title: 'PROFESSIONAL TRACK FOR IT 6', desc: '', req: 'IT 14/L' },
    ],
  },
  {
    term: '3rd Year / Summer',
    rows: [
      { grade: '', code: 'GE 9', units: 3.0, title: 'ETHICS (DISCIPLINAL)', desc: '', req: '' },
      { grade: '', code: 'IT 21/L', units: 3.0, title: 'INFORMATION ASSURANCE AND SECURITY 2', desc: '', req: 'IT 16/L' },
      { grade: '', code: 'IT 22/L', units: 3.0, title: 'CAPSTONE PROJECT 1', desc: '', req: 'IT 19/L' },
    ],
  },
  {
    term: '4th Year / 1st Sem',
    rows: [
      { grade: '', code: 'GE 20', units: 3.0, title: 'READING VISUAL ARTS', desc: '', req: '' },
      { grade: '', code: 'IT 23/L', units: 3.0, title: 'SYSTEMS ADMINISTRATION AND MAINTENANCE', desc: '', req: 'IT 21/L' },
      { grade: '', code: 'IT 24/L', units: 6.0, title: 'CAPSTONE PROJECT 2', desc: '', req: 'IT 22/L' },
      {
        grade: '',
        code: 'CAED 500C',
        units: 3.0,
        title: 'CAREER AND PERSONALITY DEVELOPMENT',
        desc: '',
        req: '4th Year Standing',
      },
    ],
  },
  {
    term: '4th Year / 2nd Sem',
    rows: [
      { grade: '', code: 'IT 25', units: 9.0, title: 'PRACTICUM', desc: '', req: '4th Year Standing' },
    ],
  },
];

export default function ProgramDetails({ program }) {
  if (!program) {
    return (
      <Card title="Program details">
        <p className="muted">Select a program on the left to view details.</p>
      </Card>
    );
  }

  const isBsit = program.code === 'BSIT';

  return (
    <Card
      title={`${program.code} · ${program.name}`}
      description={program.description}
    >
      <div className="program-details">
        <div className="program-summary">
          <div>
            <div className="muted">Program code</div>
            <div className="mono">{program.code}</div>
          </div>
          <div>
            <div className="muted">Type</div>
            <div>{program.type}</div>
          </div>
          <div>
            <div className="muted">Duration</div>
            <div>{program.durationYears} years</div>
          </div>
          <div>
            <div className="muted">Total units</div>
            <div>{program.totalUnits}</div>
          </div>
          <div>
            <div className="muted">Status</div>
            <span
              className={`pill ${program.status === 'Active' ? 'ok' : program.status === 'Phased out' ? 'warn' : 'info'}`}
            >
              {program.status}
            </span>
          </div>
        </div>

        {isBsit ? (
          <div className="program-years">
            {BSIT_PLAN.map((term) => (
              <div key={term.term} className="program-year-card">
                <div className="program-year-title">{term.term}</div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Code</th>
                        <th>Unit</th>
                        <th>Title</th>
                        <th>Prerequisites / Co-requisites</th>
                      </tr>
                    </thead>
                    <tbody>
                      {term.rows.map((row, idx) => (
                        <tr key={`${row.code}-${idx}`}>
                          <td className="mono">{row.grade}</td>
                          <td className="mono">{row.code}</td>
                          <td className="mono">{row.units.toFixed(1)}</td>
                          <td>{row.title}</td>
                          <td className="mono">{row.req || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="program-years">
            {program.yearLevels.map((yl) => (
              <div key={yl.year} className="program-year-card">
                <div className="program-year-title">{yl.year}</div>
                <ul className="program-year-subjects">
                  {yl.subjects.map((code) => (
                    <li key={code} className="mono">
                      {code}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

