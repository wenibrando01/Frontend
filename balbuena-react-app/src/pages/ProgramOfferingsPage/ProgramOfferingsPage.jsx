import React, { useMemo, useState } from 'react';
import { programs } from '../../mock/programs';
import ProgramList from '../../components/programs/ProgramList';
import ProgramDetails from '../../components/programs/ProgramDetails';

export default function ProgramOfferingsPage() {
  const [selectedCode, setSelectedCode] = useState(programs[0]?.code ?? null);
  const [filters, setFilters] = useState({ search: '', status: 'All', type: 'All' });

  const selectedProgram = useMemo(
    () => programs.find((p) => p.code === selectedCode) ?? programs[0] ?? null,
    [selectedCode]
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Offerings</div>
          <h2 className="page-title">Program offerings</h2>
          <div className="page-subtitle">
            Mock program catalog with listing, filters, and details per program. Frontend-only using local JSON data.
          </div>
        </div>
      </div>

      <div className="grid two-col programs-layout">
        <ProgramList
          programs={programs}
          selectedCode={selectedCode}
          filters={filters}
          onFiltersChange={setFilters}
          onSelect={setSelectedCode}
        />
        <ProgramDetails program={selectedProgram} />
      </div>
    </div>
  );
}

