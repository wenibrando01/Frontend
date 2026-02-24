import React, { useMemo, useState } from 'react';
import { subjects } from '../../mock/subjects';
import SubjectList from '../../components/subjects/SubjectList';
import SubjectDetails from '../../components/subjects/SubjectDetails';

export default function SubjectOfferingsPage() {
  const [selectedCode, setSelectedCode] = useState(subjects[0]?.code ?? null);
  const [filters, setFilters] = useState({
    search: '',
    term: 'All',
    units: 'All',
    prereq: 'All',
    program: 'All',
  });

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.code === selectedCode) ?? subjects[0] ?? null,
    [selectedCode]
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Offerings</div>
          <h2 className="page-title">Subject offerings</h2>
          <div className="page-subtitle">
            Mock subject catalog with filters, term indicators, and detailed view per subject. Frontend-only using local
            JSON.
          </div>
        </div>
      </div>

      <div className="grid two-col">
        <SubjectList
          subjects={subjects}
          selectedCode={selectedCode}
          filters={filters}
          onFiltersChange={setFilters}
          onSelect={setSelectedCode}
        />
        <SubjectDetails subject={selectedSubject} />
      </div>
    </div>
  );
}

