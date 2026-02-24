import React, { useMemo } from 'react';
import ProgramCard from './ProgramCard';
import FilterBar from '../filters/FilterBar';
import Card from '../ui/Card';

export default function ProgramList({ programs, selectedCode, filters, onFiltersChange, onSelect }) {
  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return programs.filter((p) => {
      if (filters.status !== 'All' && p.status !== filters.status) return false;
      if (filters.type !== 'All' && p.type !== filters.type) return false;
      if (!search) return true;
      return `${p.code} ${p.name}`.toLowerCase().includes(search);
    });
  }, [programs, filters]);

  return (
    <Card
      title="Program offerings"
      description={`${filtered.length} program(s)`}
      actions={
        <FilterBar>
          <input
            className="input"
            placeholder="Search program code or name…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
          <select
            className="input"
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          >
            <option value="All">All status</option>
            <option value="Active">Active</option>
            <option value="Phased out">Phased out</option>
            <option value="Under review">Under review</option>
          </select>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
          >
            <option value="All">All types</option>
            <option value="Bachelor's">Bachelor&apos;s</option>
            <option value="Diploma">Diploma</option>
          </select>
        </FilterBar>
      }
    >
      <div className="program-list">
        {filtered.map((p) => (
          <ProgramCard
            key={p.code}
            program={p}
            isActive={p.code === selectedCode}
            onClick={() => onSelect(p.code)}
          />
        ))}
      </div>
    </Card>
  );
}

