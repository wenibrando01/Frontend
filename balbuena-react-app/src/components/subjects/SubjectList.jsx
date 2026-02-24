import React, { useMemo } from 'react';
import SubjectCard from './SubjectCard';
import FilterBar from '../filters/FilterBar';
import Card from '../ui/Card';

export default function SubjectList({ subjects, selectedCode, filters, onFiltersChange, onSelect }) {
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return subjects.filter((s) => {
      if (filters.term !== 'All' && s.semester !== filters.term) return false;
      if (filters.units !== 'All' && String(s.units) !== filters.units) return false;
      if (filters.prereq === 'With' && (!s.prerequisites || s.prerequisites.length === 0)) return false;
      if (filters.prereq === 'Without' && s.prerequisites && s.prerequisites.length > 0) return false;
      if (filters.program !== 'All' && s.programCode !== filters.program) return false;
      if (!search) return true;
      return `${s.code} ${s.title}`.toLowerCase().includes(search);
    });
  }, [subjects, filters]);

  const programs = useMemo(() => {
    const set = new Set(subjects.map((s) => s.programCode).filter((p) => p && p !== 'All'));
    return Array.from(set);
  }, [subjects]);

  return (
    <Card
      title="Subject offerings"
      description={`${filtered.length} subject(s)`}
      actions={
        <FilterBar>
          <input
            className="input"
            placeholder="Search subject code or title…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
          <select
            className="input"
            value={filters.term}
            onChange={(e) => onFiltersChange({ ...filters, term: e.target.value })}
          >
            <option value="All">All terms</option>
            <option value="1st Sem">1st Sem</option>
            <option value="2nd Sem">2nd Sem</option>
            <option value="Midyear">Midyear</option>
            <option value="Flexible">Flexible</option>
          </select>
          <select
            className="input"
            value={filters.units}
            onChange={(e) => onFiltersChange({ ...filters, units: e.target.value })}
          >
            <option value="All">All units</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="5">5</option>
          </select>
          <select
            className="input"
            value={filters.prereq}
            onChange={(e) => onFiltersChange({ ...filters, prereq: e.target.value })}
          >
            <option value="All">All subjects</option>
            <option value="With">With pre-reqs</option>
            <option value="Without">Without pre-reqs</option>
          </select>
          <select
            className="input"
            value={filters.program}
            onChange={(e) => onFiltersChange({ ...filters, program: e.target.value })}
          >
            <option value="All">All programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FilterBar>
      }
    >
      <div className="subject-list">
        {filtered.map((s) => (
          <SubjectCard key={s.code} subject={s} isActive={s.code === selectedCode} onClick={() => onSelect(s.code)} />
        ))}
      </div>
    </Card>
  );
}

