'use client';

import { useState, useEffect, useRef } from 'react';
import './aud.css';

// ─── Data ────────────────────────────────────────────────────────────────────

interface Deliverable {
  id: string;
  text: string;
  pct: number;
}

interface Snapshot {
  completion: number;
  charges: number;
  remainder: number;
  itemTotal: number;
  burn: number;
  tripsDone?: number;
}

interface HistorySnapshot {
  snapshot: Snapshot;
  deliverables: Deliverable[];
}

interface Subphase {
  id: string;
  title: string;
  start: number;
  min: number;
  max: number;
  actual?: { start: number; end: number };
  cost: number;
  contingency: number;
  trips: number;
  annual?: boolean;
  oneliner: string;
  snapshot: Snapshot;
  deliverables: Deliverable[];
  history?: Record<string, HistorySnapshot>;
}

interface Phase {
  id: string;
  label: string;
  name: string;
  blurb: string;
  start: number;
  minDuration: number;
  maxDuration: number;
  cost: number;
  trips: number;
  color: 'p1' | 'p2';
  subphases: Subphase[];
}

const PHASES: Phase[] = [
  {
    id: 'P1',
    label: 'Phase 1',
    name: 'Alliance Alignment, Project Mapping & Approval Submission',
    blurb: 'Establish goals, governance, curriculum framework and submit for regulatory approval of the 4-year MD program.',
    start: 0,
    minDuration: 14,
    maxDuration: 18,
    cost: 1375434,
    trips: 12,
    color: 'p1',
    subphases: [
      {
        id: '1.1',
        title: 'Strategic Partner Alignment, Logistics & Project Mapping',
        start: 0, min: 3, max: 4,
        actual: { start: 0, end: 12 },
        cost: 522025, contingency: 0, trips: 5,
        oneliner: 'Define partner roles, governance, working teams, feasibility, accreditation pathway and clinical-site candidates.',
        snapshot: { completion: 0.8328, charges: 384809.75, remainder: 137215.25, itemTotal: 522025, burn: 0.7371, tripsDone: 4 },
        history: {
          y1q1: {
            snapshot: { completion: 0.5306, charges: 384809.75, remainder: 137215.25, itemTotal: 522025, burn: 0.7371, tripsDone: 4 },
            deliverables: [
              { id: '1.1a', text: 'Project Roles and Deliverables Defined', pct: 100 },
              { id: '1.1b', text: 'Project Governance Framework Established', pct: 90 },
              { id: '1.1c', text: 'Analyze Feasibility Documents/Studies', pct: 0 },
              { id: '1.1d', text: 'Analyze CAA & SACSCOC Requirements', pct: 63 },
              { id: '1.1e', text: 'Analyze Structural Requirements & Policy Gaps', pct: 80 },
              { id: '1.1f', text: 'Facilities Needs Defined', pct: 30 },
              { id: '1.1g', text: 'Assessment of Central Services', pct: 10 },
              { id: '1.1h', text: 'Two Clinical Partners Identified', pct: 80 },
              { id: '1.1i', text: 'Quarterly Assessment of project needs, expenses, and timing', pct: 24.55 },
            ],
          },
          y1q2: {
            snapshot: { completion: 0.7162, charges: 384809.75, remainder: 137215.25, itemTotal: 522025, burn: 0.7371, tripsDone: 4 },
            deliverables: [
              { id: '1.1a', text: 'Project Roles and Deliverables Defined', pct: 100 },
              { id: '1.1b', text: 'Project Governance Framework Established', pct: 95 },
              { id: '1.1c', text: 'Analyze Feasibility Documents/Studies', pct: 50 },
              { id: '1.1d', text: 'Analyze CAA & SACSCOC Requirements', pct: 90 },
              { id: '1.1e', text: 'Analyze Structural Requirements & Policy Gaps', pct: 80 },
              { id: '1.1f', text: 'Facilities Needs Defined', pct: 35 },
              { id: '1.1g', text: 'Assessment of Central Services', pct: 50 },
              { id: '1.1h', text: 'Two Clinical Partners Identified', pct: 100 },
              { id: '1.1i', text: 'Quarterly Assessment of project needs, expenses, and timing', pct: 44.55 },
            ],
          },
        },
        deliverables: [
          { id: '1.1a', text: 'Project Roles and Deliverables Defined', pct: 100 },
          { id: '1.1b', text: 'Project Governance Framework Established', pct: 100 },
          { id: '1.1c', text: 'Analyze Feasibility Documents/Studies', pct: 100 },
          { id: '1.1d', text: 'Analyze CAA & SACSCOC Requirements', pct: 100 },
          { id: '1.1e', text: 'Analyze Structural Requirements & Policy Gaps', pct: 80 },
          { id: '1.1f', text: 'Facilities Needs Defined', pct: 50 },
          { id: '1.1g', text: 'Assessment of Central Services', pct: 50 },
          { id: '1.1h', text: 'Two Clinical Partners Identified', pct: 100 },
          { id: '1.1i', text: 'Quarterly Assessment of project needs, expenses, and timing', pct: 69.55 },
        ],
      },
      {
        id: '1.2',
        title: 'Essential Materials Preparation & Approval Submission',
        start: 3, min: 9, max: 12,
        actual: { start: 6, end: 18 },
        cost: 809966, contingency: 56800, trips: 7,
        oneliner: 'Build the SOM administrative + curriculum framework and submit for UAE Ministry / CAA / SACSCOC approval.',
        snapshot: { completion: 0.2443, charges: 0, remainder: 809966, itemTotal: 809966, burn: 0 },
        history: {
          y1q1: {
            snapshot: { completion: 0, charges: 0, remainder: 809966, itemTotal: 809966, burn: 0 },
            deliverables: [
              { id: '1.2a', text: 'SOM administrative structure outlined', pct: 0 },
              { id: '1.2a.1', text: 'Prepare Org Chart & Onboarding Timeline', pct: 0 },
              { id: '1.2a.2', text: 'Description of Roles & Responsibilities to populate JDs', pct: 0 },
              { id: '1.2b', text: 'Key SOM committees outlined', pct: 0 },
              { id: '1.2c', text: 'Clinical MOUs finalized', pct: 0 },
              { id: '1.2d', text: 'MD curriculum framework developed', pct: 0 },
              { id: '1.2d.1', text: 'Define competencies, goals, and graduate attributes', pct: 0 },
              { id: '1.2d.2', text: 'Map required courses to accreditation standards', pct: 0 },
              { id: '1.2d.3', text: 'Sequence pedagogy for integrated curriculum flow', pct: 0 },
              { id: '1.2d.4', text: 'Embed professionalism, teamwork, and ethical decision components', pct: 0 },
              { id: '1.2d.5', text: 'Map path to integrate simulation, AI, VR, digital platforms', pct: 0 },
              { id: '1.2d.6', text: 'Outline student and faculty assessment approach', pct: 0 },
              { id: '1.2d.7', text: 'Define medical research training program options', pct: 0 },
              { id: '1.2d.8', text: 'List required course directors and faculty attributes and experience to populate JDs', pct: 0 },
              { id: '1.2d.9', text: 'Vet framework with government & partners for comment', pct: 0 },
              { id: '1.2e', text: 'CAA application submitted', pct: 0 },
              { id: '1.2e.1', text: 'Revise framework and assemble required documents', pct: 0 },
              { id: '1.2e.2', text: 'Support AUD with CAA discussions, presentations, submissions, and revisions (including visits)', pct: 0 },
              { id: '1.2f', text: 'SACSCOC application submitted', pct: 0 },
            ],
          },
          y1q2: {
            snapshot: { completion: 0, charges: 0, remainder: 809966, itemTotal: 809966, burn: 0 },
            deliverables: [
              { id: '1.2a', text: 'SOM administrative structure outlined', pct: 0 },
              { id: '1.2a.1', text: 'Prepare Org Chart & Onboarding Timeline', pct: 0 },
              { id: '1.2a.2', text: 'Description of Roles & Responsibilities to populate JDs', pct: 0 },
              { id: '1.2b', text: 'Key SOM committees outlined', pct: 0 },
              { id: '1.2c', text: 'Clinical MOUs finalized', pct: 0 },
              { id: '1.2d', text: 'MD curriculum framework developed', pct: 0 },
              { id: '1.2d.1', text: 'Define competencies, goals, and graduate attributes', pct: 0 },
              { id: '1.2d.2', text: 'Map required courses to accreditation standards', pct: 0 },
              { id: '1.2d.3', text: 'Sequence pedagogy for integrated curriculum flow', pct: 0 },
              { id: '1.2d.4', text: 'Embed professionalism, teamwork, and ethical decision components', pct: 0 },
              { id: '1.2d.5', text: 'Map path to integrate simulation, AI, VR, digital platforms', pct: 0 },
              { id: '1.2d.6', text: 'Outline student and faculty assessment approach', pct: 0 },
              { id: '1.2d.7', text: 'Define medical research training program options', pct: 0 },
              { id: '1.2d.8', text: 'List required course directors and faculty attributes and experience to populate JDs', pct: 0 },
              { id: '1.2d.9', text: 'Vet framework with government & partners for comment', pct: 0 },
              { id: '1.2e', text: 'CAA application submitted', pct: 0 },
              { id: '1.2e.1', text: 'Revise framework and assemble required documents', pct: 0 },
              { id: '1.2e.2', text: 'Support AUD with CAA discussions, presentations, submissions, and revisions (including visits)', pct: 0 },
              { id: '1.2f', text: 'SACSCOC application submitted', pct: 0 },
            ],
          },
        },
        deliverables: [
          { id: '1.2a', text: 'SOM administrative structure outlined', pct: 50 },
          { id: '1.2a.1', text: 'Prepare Org Chart & Onboarding Timeline', pct: 100 },
          { id: '1.2a.2', text: 'Description of Roles & Responsibilities to populate JDs', pct: 0 },
          { id: '1.2b', text: 'Key SOM committees outlined', pct: 0 },
          { id: '1.2c', text: 'Clinical MOUs finalized', pct: 0 },
          { id: '1.2d', text: 'MD curriculum framework developed', pct: 14.21 },
          { id: '1.2d.1', text: 'Define competencies, goals, and graduate attributes', pct: 100 },
          { id: '1.2d.2', text: 'Map required courses to accreditation standards', pct: 0 },
          { id: '1.2d.3', text: 'Sequence pedagogy for integrated curriculum flow', pct: 100 },
          { id: '1.2d.4', text: 'Embed professionalism, teamwork, and ethical decision components', pct: 100 },
          { id: '1.2d.5', text: 'Map path to integrate simulation, AI, VR, digital platforms', pct: 0 },
          { id: '1.2d.6', text: 'Outline student and faculty assessment approach', pct: 0 },
          { id: '1.2d.7', text: 'Define medical research training program options', pct: 0 },
          { id: '1.2d.8', text: 'List required course directors and faculty attributes and experience to populate JDs', pct: 0 },
          { id: '1.2d.9', text: 'Vet framework with government & partners for comment', pct: 0 },
          { id: '1.2e', text: 'CAA application submitted', pct: 0 },
          { id: '1.2e.1', text: 'Revise framework and assemble required documents', pct: 0 },
          { id: '1.2e.2', text: 'Support AUD with CAA discussions, presentations, submissions, and revisions (including visits)', pct: 0 },
          { id: '1.2f', text: 'SACSCOC application submitted', pct: 0 },
        ],
      },
      {
        id: '1.3',
        title: 'Admissions & Marketing Planning',
        start: 12, min: 1, max: 2,
        cost: 43443, contingency: 0, trips: 0,
        oneliner: 'Pre-launch admissions design — standards, decision process, logistics, recruitment cadence.',
        snapshot: { completion: 0, charges: 0, remainder: 43443, itemTotal: 43443, burn: 0 },
        history: {
          y1q1: {
            snapshot: { completion: 0, charges: 0, remainder: 43443, itemTotal: 43443, burn: 0 },
            deliverables: [
              { id: '1.3a', text: 'Admissions Standards & Criteria established', pct: 0 },
              { id: '1.3b', text: 'Admissions Committee role defined', pct: 0 },
              { id: '1.3c', text: 'Admissions process determined', pct: 0 },
              { id: '1.3d', text: 'Penn role in admissions determined', pct: 0 },
            ],
          },
          y1q2: {
            snapshot: { completion: 0, charges: 0, remainder: 43443, itemTotal: 43443, burn: 0 },
            deliverables: [
              { id: '1.3a', text: 'Admissions Standards & Criteria established', pct: 0 },
              { id: '1.3b', text: 'Admissions Committee role defined', pct: 0 },
              { id: '1.3c', text: 'Admissions process determined', pct: 0 },
              { id: '1.3d', text: 'Penn role in admissions determined', pct: 0 },
            ],
          },
        },
        deliverables: [
          { id: '1.3a', text: 'Admissions Standards & Criteria established', pct: 0 },
          { id: '1.3b', text: 'Admissions Committee role defined', pct: 0 },
          { id: '1.3c', text: 'Admissions process determined', pct: 0 },
          { id: '1.3d', text: 'Penn role in admissions determined', pct: 0 },
        ],
      },
    ],
  },
  {
    id: 'P2',
    label: 'Phase 2',
    name: 'Project Launch — Marketing, Admissions, Pre-Clinical Curriculum, Faculty',
    blurb: 'Launch the SOM: finalize leadership, run first admissions cycle, build the pre-clinical curriculum and develop faculty.',
    start: 14,
    minDuration: 16,
    maxDuration: 20,
    cost: 5749960,
    trips: 26,
    color: 'p2',
    subphases: [
      {
        id: '2.1',
        title: 'Finalizing the School Leadership Team',
        start: 14, min: 3, max: 6,
        cost: 52000, contingency: 0, trips: 0,
        oneliner: 'Finalize SOM documents, architectural / IT plans, recruit Dean, Vice Deans and program directors.',
        snapshot: { completion: 0, charges: 0, remainder: 52000, itemTotal: 52000, burn: 0 },
        deliverables: [
          { id: '2.1a', text: 'SOM policies and procedures finalized', pct: 0 },
          { id: '2.1b', text: 'Facilities and simulation plans refined', pct: 0 },
          { id: '2.1c', text: 'Senior SOM leadership recruitment supported', pct: 0 },
        ],
      },
      {
        id: '2.2',
        title: 'Admission Process & Student Selection',
        start: 14, min: 4, max: 6,
        cost: 367800, contingency: 329200, trips: 5, annual: true,
        oneliner: 'Launch first admissions cycle. Annual continuation across the program lifetime.',
        snapshot: { completion: 0, charges: 0, remainder: 367800, itemTotal: 367800, burn: 0 },
        deliverables: [
          { id: '2.2a', text: 'Admissions outreach and marketing launched', pct: 0 },
          { id: '2.2b', text: 'Virtual admissions participation supported', pct: 0 },
          { id: '2.2c', text: 'Penn admissions advisor appointed', pct: 0 },
          { id: '2.2d', text: 'Admissions interviews supported', pct: 0 },
        ],
      },
      {
        id: '2.3',
        title: 'Pre-Clinical Course Material & Faculty Selection',
        start: 17, min: 12, max: 12,
        cost: 4359760, contingency: 126600, trips: 0,
        oneliner: 'Build the full pre-clinical curriculum (Y1–Y1.5): ≥25 integrated courses, faculty matrix, AI/VR mapping.',
        snapshot: { completion: 0, charges: 0, remainder: 4359760, itemTotal: 4359760, burn: 0 },
        deliverables: [
          { id: '2.3a', text: 'Pre-clinical curriculum materials developed', pct: 0 },
          { id: '2.3b', text: 'Course instructional materials created', pct: 0 },
          { id: '2.3c', text: 'Faculty expectations and recruitment defined', pct: 0 },
          { id: '2.3d', text: 'Simulation and AV/VR integration planned', pct: 0 },
        ],
      },
      {
        id: '2.4',
        title: 'Faculty & Staff Professional Development',
        start: 14, min: 24, max: 24,
        cost: 1000000, contingency: 386500, trips: 21, annual: true,
        oneliner: 'Pair Dean\'s senior staff with PennMed partners; develop pre-clinical teaching faculty over 4-year onramp.',
        snapshot: { completion: 0, charges: 0, remainder: 811000, itemTotal: 811000, burn: 0 },
        deliverables: [
          { id: '2.4a', text: 'Faculty development program established', pct: 0 },
          { id: '2.4b', text: 'Senior staff mentorship structure implemented', pct: 0 },
          { id: '2.4c', text: 'Pre-clinical faculty training supported', pct: 0 },
          { id: '2.4d', text: 'Curriculum delivery readiness assessed', pct: 0 },
        ],
      },
    ],
  },
];

// ─── View resolution ────────────────────────────────────────────────────────

type ViewMode = 'actual' | 'ideal' | 'y1q1' | 'y1q2';

// Resolve the effective snapshot + deliverables for a given toggle view.
// "y1q1"/"y1q2" pull historical (pre-sync) data if present; "ideal" zeroes
// everything out to represent the original, pre-work proposal.
function getSubView(sub: Subphase, view: ViewMode): { snapshot: Snapshot; deliverables: Deliverable[] } {
  if ((view === 'y1q2' || view === 'y1q1') && sub.history?.[view]) {
    return sub.history[view];
  }
  if (view === 'ideal') {
    return {
      snapshot: { ...sub.snapshot, completion: 0 },
      deliverables: sub.deliverables.map((d) => ({ ...d, pct: 0 })),
    };
  }
  return { snapshot: sub.snapshot, deliverables: sub.deliverables };
}

// ─── Timeline constants ───────────────────────────────────────────────────────

const TIMELINE_END = 38;
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const QUARTERS: Record<number, string> = { 9: 'Q1', 0: 'Q2', 3: 'Q3', 6: 'Q4' };
const MILESTONES = [
  { month: 13, label: 'Accreditation' },
  { month: 35, label: 'Class Begins' },
];

function monthLabel(m: number) {
  const idx = (9 + Math.floor(m)) % 12;
  const yr = 2025 + Math.floor((9 + Math.floor(m)) / 12);
  return { name: MONTH_NAMES[idx], year: yr, quarter: QUARTERS[idx] };
}

// ─── MonthAxis ────────────────────────────────────────────────────────────────

function MonthAxis({ pxPerMonth }: { pxPerMonth: number }) {
  const ticks = [];
  for (let m = 0; m <= TIMELINE_END; m += 3) ticks.push(m);
  return (
    <div className="axis-track" style={{ position: 'relative', height: 20 }}>
      <div className="axis-line" />
      {ticks.map((m) => {
        const { name } = monthLabel(m);
        return (
          <div key={m} className="tick" style={{ left: m * pxPerMonth }}>
            <div className="tick-mark" />
            <div className="tick-label">
              <span className="tick-month">{name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SubphaseBar ──────────────────────────────────────────────────────────────

interface SubphaseBarProps {
  sub: Subphase;
  phaseColor: 'p1' | 'p2';
  pxPerMonth: number;
  isActive: boolean;
  onClick: () => void;
  view: ViewMode;
  rowIndex: number;
}

function SubphaseBar({ sub, phaseColor, pxPerMonth, isActive, onClick, view, rowIndex }: SubphaseBarProps) {
  const idealStart = sub.start;
  const idealEnd = sub.start + sub.max;
  const actual = sub.actual ?? { start: idealStart, end: idealEnd };
  const useActual = view === 'actual' || view === 'y1q2' || view === 'y1q1';

  const barStart = useActual ? actual.start : idealStart;
  const barEnd = useActual ? actual.end : idealEnd;
  const left = barStart * pxPerMonth;
  const barW = (barEnd - barStart) * pxPerMonth;

  const slip = useActual ? actual.end - idealEnd : 0;
  const hasSlip = slip > 0.01;

  const viewData = getSubView(sub, view);
  const completion = viewData.snapshot?.completion ?? 0;
  const completionPct = Math.round(completion * 1000) / 10;

  return (
    <div
      className={`sub-row${isActive ? ' active' : ''}`}
      onClick={onClick}
      style={{ '--row-i': rowIndex } as React.CSSProperties}
    >
      <div className="sub-row-label">
        <span className="sub-id">{sub.id}</span>
        <span className="sub-title">{sub.title}</span>
      </div>
      <div className="sub-row-track">
        <div
          className={`sub-bar sub-${phaseColor}${hasSlip ? ' has-slip' : ''}`}
          style={{ left, width: barW }}
          title={`${completionPct}% of deliverables complete`}
        >
          <div
            className="sub-bar-remain"
            style={{ left: `${completion * 100}%`, opacity: useActual ? 1 : 0 }}
          />
          <div
            className="sub-bar-fillline"
            style={{ left: `${completion * 100}%`, opacity: useActual && completion > 0 && completion < 1 ? 1 : 0 }}
          />
          <span className="sub-bar-id">
            {sub.id}{useActual ? ` · ${completionPct}%` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

interface TimelineProps {
  activeSubId: string | null;
  onSelect: (id: string) => void;
  view: ViewMode;
}

function Timeline({ activeSubId, onSelect, view }: TimelineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(900);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [activeMarker, setActiveMarker] = useState<{ month: number; label: string; kind: string } | null>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 3600 * 1000);
    return () => clearInterval(id);
  }, []);

  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const todayOffset =
    (now.getFullYear() - 2025) * 12 + (now.getMonth() - 9) +
    (now.getDate() - 1) / daysInMonth(now);
  const showToday = todayOffset >= 0 && todayOffset <= TIMELINE_END;

  const TRACK_LEFT = 340;

  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth - 320 - 40;
      setTrackWidth(Math.max(600, w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const pxPerMonth = trackWidth / TIMELINE_END;

  const markers = [
    ...(showToday ? [{ month: todayOffset, label: 'Today', kind: 'today' }] : []),
    ...MILESTONES.map((m) => ({ ...m, kind: 'milestone' })),
  ];

  const onTrackMove = (e: React.MouseEvent) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - TRACK_LEFT;
    if (x < 0 || x > trackWidth) { setHoverX(null); setActiveMarker(null); return; }
    setHoverX(x);
    let near: typeof markers[0] | null = null, best = 8.5;
    for (const mk of markers) {
      const d = Math.abs(x - mk.month * pxPerMonth);
      if (d <= best) { best = d; near = mk; }
    }
    setActiveMarker(near);
  };

  const hoverMonthIdx = hoverX == null ? 0 : Math.min(TIMELINE_END - 1, Math.floor(hoverX / pxPerMonth));
  const hoverInfo = hoverX == null ? null : monthLabel(hoverMonthIdx);
  const hoverMonthNum = hoverX == null ? 0 : hoverX / pxPerMonth;

  const allSubs = PHASES.flatMap((p) =>
    p.subphases.map((s) => ({ ...s, phaseColor: p.color, phaseId: p.id }))
  );

  return (
    <div className="timeline-wrap" ref={wrapRef}>
      <div className="timeline-header">
        <div>
          {!activeSubId && (
            <span className="tl-cta">
              <span className="tl-cta-dot" />
              Click bars to learn more
            </span>
          )}
        </div>
        <div />
      </div>

      <div className="timeline-scroll">
        <div
          className="timeline-inner"
          ref={innerRef}
          onMouseMove={onTrackMove}
          onMouseLeave={() => { setHoverX(null); setActiveMarker(null); }}
        >
          {hoverX != null && (
            <div
              className={`timeline-playhead${activeMarker ? ' ph-' + activeMarker.kind : ''}`}
              style={{ left: TRACK_LEFT + (activeMarker ? activeMarker.month * pxPerMonth : hoverX) }}
            >
              <div className="playhead-flag">
                {activeMarker ? (
                  <>
                    <span className="ph-month">
                      {monthLabel(Math.round(activeMarker.month)).name}{' '}
                      {monthLabel(Math.round(activeMarker.month)).year}
                    </span>
                    <span className="ph-sub">{activeMarker.label}</span>
                  </>
                ) : (
                  <>
                    <span className="ph-month">{hoverInfo!.name} {hoverInfo!.year}</span>
                    <span className="ph-sub">Month {Math.round(hoverMonthNum)} · {hoverInfo!.quarter}</span>
                  </>
                )}
              </div>
              <div className="playhead-line" />
            </div>
          )}

          {/* Fixed milestone playheads */}
          {MILESTONES.map((mk) => {
            const isActive = activeMarker?.label === mk.label;
            return (
              <div key={mk.label} className="timeline-marker" style={{ left: TRACK_LEFT + mk.month * pxPerMonth }}>
                <span className={`marker-tag${isActive ? ' is-active' : ''}`}>{mk.label}</span>
                <div className="marker-line" />
              </div>
            );
          })}

          {/* Live today playhead */}
          {showToday && (
            <div className="timeline-today" style={{ left: TRACK_LEFT + todayOffset * pxPerMonth }}>
              <span className={`marker-tag today-tag${activeMarker?.kind === 'today' ? ' is-active' : ''}`}>Today</span>
              <div className="today-line" />
            </div>
          )}

          {/* Axis */}
          <div className="axis-band">
            <div style={{ width: 320 }} />
            <div style={{ width: trackWidth }}>
              <MonthAxis pxPerMonth={pxPerMonth} />
            </div>
          </div>

          {/* Year band */}
          <div className="year-band">
            <div style={{ width: 320 }} />
            <div className="year-track" style={{ width: trackWidth }}>
              {[1, 2, 3].map((yr) => {
                const start = (yr - 1) * 12;
                if (start >= TIMELINE_END) return null;
                const end = Math.min(start + 12, TIMELINE_END);
                return (
                  <div key={yr} className="year-cell" style={{ left: start * pxPerMonth, width: (end - start) * pxPerMonth }}>
                    <span className="year-label">Year {yr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-phase rows */}
          <div className="rows">
            {allSubs.map((sub, i) => (
              <SubphaseBar
                key={sub.id}
                sub={sub}
                phaseColor={sub.phaseColor}
                pxPerMonth={pxPerMonth}
                isActive={activeSubId === sub.id}
                onClick={() => onSelect(sub.id)}
                view={view}
                rowIndex={i}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="timeline-legend">
        <span className="lg-item"><span className="lg-swatch lg-p1" />Phase 1</span>
        <span className="lg-item"><span className="lg-swatch lg-p2" />Phase 2</span>
        <span className="lg-item"><span className="lg-swatch lg-incomplete" />Incomplete</span>
        <span className="lg-hint">Click a sub-phase bar for its Progress Snapshot · hover a marker or the track for dates</span>
      </div>
    </div>
  );
}

// ─── SnapshotCards ────────────────────────────────────────────────────────────

function SnapshotCards({ sub, snap }: { sub: Subphase; snap: Snapshot }) {
  const pct = (n: number) => (n * 100).toFixed(n === 0 ? 0 : 2) + '%';
  const rag = (n: number) => (n === 0 ? null : n >= 0.67 ? 'green' : 'yellow');
  return (
    <div className="snapshot">
      <div className="snap-grid">
        <div className="snap-card snap-pct">
          <div className="snap-label">Completion rate</div>
          <div className="snap-pct-row">
            {rag(snap.completion) && <span className={`snap-dot ${rag(snap.completion)}`} />}
            <span className="snap-big">{pct(snap.completion)}</span>
          </div>
        </div>
        <div className="snap-card">
          <div className="snap-label">Trips completed</div>
          <div className="snap-money">{`${snap.tripsDone ?? 0} of ${sub.trips}`}</div>
        </div>
      </div>
    </div>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

function DetailPanel({ activeSubId, view, onClose }: { activeSubId: string | null; view: ViewMode; onClose: () => void }) {
  let sub: Subphase | null = null;
  let phase: Phase | null = null;
  for (const p of PHASES) {
    const s = p.subphases.find((x) => x.id === activeSubId);
    if (s) { sub = s; phase = p; break; }
  }
  if (!sub || !phase) return null;

  const viewData = getSubView(sub, view);

  return (
    <div className="detail-panel is-overlay" role="dialog" aria-label={`Sub-phase ${sub.id} detail`}>
      <div className="dp-header">
        <div className="dp-head-left">
          <span className={`dp-tag dp-tag-${phase.color}`}>{sub.id}</span>
          <h2 className="dp-title">{sub.title}</h2>
        </div>
        <button className="dp-close" onClick={onClose} aria-label="Close detail">×</button>
      </div>

      <SnapshotCards sub={sub} snap={viewData.snapshot} />

      <div className="dp-section-title">Key deliverables</div>
      <ol className="dp-deliverables">
        {viewData.deliverables.map((d, i) => {
          const pct = d.pct;
          const rag = pct === 0 ? null : pct >= 67 ? 'green' : 'yellow';
          return (
            <li key={i}>
              <span className="dp-d-num">{d.id}</span>
              <span className="dp-d-body">
                <span className="dp-d-text">{d.text}</span>
              </span>
              <span className="dp-d-status">
                {rag && <span className={`dp-d-dot ${rag}`} />}
                <span className={`dp-d-pct${pct === 0 ? ' is-zero' : ''}`}>
                  {Number.isInteger(pct) ? pct : pct.toFixed(2)}%
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── TimelineTab ──────────────────────────────────────────────────────────────

const PLAY_SEQUENCE: ViewMode[] = ['ideal', 'y1q1', 'y1q2', 'actual'];
const PLAY_STEP_MS = 2000;

function TimelineTab() {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>('actual');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const currentIdx = PLAY_SEQUENCE.indexOf(view);
    const startIdx = currentIdx === -1 ? 0 : currentIdx;
    if (startIdx >= PLAY_SEQUENCE.length - 1) return;
    const id = setTimeout(() => setView(PLAY_SEQUENCE[startIdx + 1]), PLAY_STEP_MS);
    return () => clearTimeout(id);
  }, [isPlaying, view]);

  useEffect(() => {
    if (isPlaying && view === PLAY_SEQUENCE[PLAY_SEQUENCE.length - 1]) {
      const id = setTimeout(() => setIsPlaying(false), PLAY_STEP_MS);
      return () => clearTimeout(id);
    }
  }, [isPlaying, view]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setView(PLAY_SEQUENCE[0]);
      setIsPlaying(true);
    }
  };

  const jumpTo = (v: ViewMode) => {
    setIsPlaying(false);
    setView(v);
  };

  return (
    <div className="doc doc-compact">
      <div className="tl-bar">
        <div className="tl-bar-left">
          <span className="kicker"></span>
          <h1 className="tl-bar-title">Timelines &amp; Progress Snapshots</h1>
        </div>
      </div>

      <div className="tl-viewrow">
        <div className="tl-play-wrap">
          <div className="tl-play-note" aria-hidden="true">
            <span className="tl-play-note-text">click me</span>
            <svg viewBox="0 0 30 20" fill="none">
              <path d="M2 10 C 10 6, 18 6, 24 8" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 8 L 19 4.5 M24 8 L 20 12" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <button
            type="button"
            className={`tl-play-btn${isPlaying ? ' is-playing' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play through view states'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M4 2.5v11l10-5.5-10-5.5z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
        <div className="tl-toggle" role="tablist" aria-label="Timeline view">
          <button
            role="tab"
            aria-selected={view === 'actual'}
            className={`tl-toggle-btn${view === 'actual' ? ' is-on' : ''}`}
            onClick={() => jumpTo('actual')}
          >
            Y1Q3
          </button>
          <button
            role="tab"
            aria-selected={view === 'y1q2'}
            className={`tl-toggle-btn${view === 'y1q2' ? ' is-on' : ''}`}
            onClick={() => jumpTo('y1q2')}
          >
            Y1Q2
          </button>
          <button
            role="tab"
            aria-selected={view === 'y1q1'}
            className={`tl-toggle-btn${view === 'y1q1' ? ' is-on' : ''}`}
            onClick={() => jumpTo('y1q1')}
          >
            Y1Q1
          </button>
          <button
            role="tab"
            aria-selected={view === 'ideal'}
            className={`tl-toggle-btn${view === 'ideal' ? ' is-on' : ''}`}
            onClick={() => jumpTo('ideal')}
          >
            PROPOSAL
          </button>
        </div>
        <span className="tl-viewrow-note">
          {view === 'ideal'
            ? 'As written in SOW1 October 2025'
            : view === 'y1q2'
            ? "Earlier snapshot — before today's data sync"
            : view === 'y1q1'
            ? 'Earliest snapshot on record'
            : ''}
        </span>
      </div>

      <div className="main-grid">
        <div className="timeline-stage">
          <Timeline
            activeSubId={activeSubId}
            view={view}
            onSelect={(id) => setActiveSubId(id === activeSubId ? null : id)}
          />
          {activeSubId && (
            <div className="detail-backdrop" onClick={() => setActiveSubId(null)} />
          )}
          <DetailPanel activeSubId={activeSubId} view={view} onClose={() => setActiveSubId(null)} />
        </div>
      </div>

      <footer className="doc-footer">
        <span>Source · Redline_v2_AUD_PennMed_SOW.Final · October 2025</span>
        <span>Click any sub-phase bar in the timeline for full deliverables.</span>
      </footer>
    </div>
  );
}

// ─── Phase1BreakdownTab (WBS) ─────────────────────────────────────────────────

interface WbsGroup {
  label: string;
  ids: string[];
}

interface WbsColumnDef {
  num: string;
  title: string;
  accent: string;
  groups: WbsGroup[];
}

// Column definitions — mirrors the source WBS chart's groupings & left-to-right order.
const WBS_COLUMNS: WbsColumnDef[] = [
  {
    num: '1',
    title: 'Clinical Partners Ready',
    accent: 'wbs-green',
    groups: [
      { label: '1.1 Activities', ids: ['1.1h'] },
      { label: '1.2 Activities', ids: ['1.2c'] },
    ],
  },
  {
    num: '2',
    title: 'Facilities and Services Ready',
    accent: 'wbs-blue',
    groups: [
      { label: '1.1 Activities', ids: ['1.1f', '1.1g'] },
    ],
  },
  {
    num: '4',
    title: 'Curriculum Ready',
    accent: 'wbs-orange',
    groups: [
      {
        label: '1.2 Activities',
        ids: [
          '1.2d', '1.2d.1', '1.2d.2', '1.2d.3', '1.2d.4',
          '1.2d.5', '1.2d.6', '1.2d.7', '1.2d.8', '1.2d.9',
        ],
      },
    ],
  },
  {
    num: '5',
    title: 'CAA & SACS Submitted',
    accent: 'wbs-teal',
    groups: [
      { label: '1.1 Activities', ids: ['1.1c', '1.1d', '1.1e'] },
      { label: '1.2 Activities', ids: ['1.2e', '1.2e.1', '1.2e.2', '1.2f'] },
    ],
  },
  {
    num: '6',
    title: 'Governance & Leadership Ready',
    accent: 'wbs-red',
    groups: [
      { label: '1.1 Activities', ids: ['1.1a', '1.1b', '1.1i'] },
      { label: '1.2 Activities', ids: ['1.2a', '1.2a.1', '1.2a.2', '1.2b'] },
    ],
  },
  {
    num: '3',
    title: 'Admissions Strategy Ready',
    accent: 'wbs-purple',
    groups: [
      { label: '1.3 Activities', ids: ['1.3a', '1.3b', '1.3c', '1.3d'] },
    ],
  },
];

function findDeliverable(id: string, view: ViewMode): Deliverable | null {
  for (const phase of PHASES) {
    for (const sub of phase.subphases) {
      const viewData = getSubView(sub, view);
      const d = viewData.deliverables.find((x) => x.id === id);
      if (d) return d;
    }
  }
  return null;
}

type WbsStatus = 'green' | 'yellow' | 'blue';

function statusOf(pct: number): WbsStatus {
  if (pct >= 99.5) return 'green';
  if (pct > 0) return 'yellow';
  return 'blue';
}

const STATUS_LABEL: Record<WbsStatus, string> = { green: 'Complete', yellow: 'Ongoing', blue: 'Not started' };

function WbsColumn({ col, view, popKeys }: { col: WbsColumnDef; view: ViewMode; popKeys: Record<string, number> }) {
  return (
    <div className={`wbs-col ${col.accent}`}>
      <div className="wbs-col-head">
        <span className="wbs-col-title">{col.title}</span>
      </div>
      <div className="wbs-col-body">
        {col.groups.map((g) => (
          <div className="wbs-group" key={g.label}>
            <div className="wbs-group-label">{g.label}</div>
            {g.ids.map((id) => {
              const d = findDeliverable(id, view);
              if (!d) return null;
              const s = statusOf(d.pct);
              return (
                <div className="wbs-item" key={id}>
                  <span className="wbs-item-id">{d.id}</span>
                  <span className="wbs-item-text">{d.text}</span>
                  {s !== 'blue' && (
                    <span
                      key={`${id}-${popKeys[id] || 0}`}
                      className={`wbs-dot ${s}${popKeys[id] ? ' wbs-dot-pop' : ''}`}
                      title={STATUS_LABEL[s]}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Chronological playback order: oldest → newest
const P1G_PLAY_SEQUENCE: ViewMode[] = ['ideal', 'y1q1', 'y1q2', 'actual'];
const P1G_PLAY_STEP_MS = 2000;

function Phase1BreakdownTab() {
  const [view, setView] = useState<ViewMode>('actual');
  const [isPlaying, setIsPlaying] = useState(false);
  const [popKeys, setPopKeys] = useState<Record<string, number>>({});
  const prevStatusesRef = useRef<Record<string, WbsStatus> | null>(null);

  useEffect(() => {
    const current: Record<string, WbsStatus> = {};
    WBS_COLUMNS.forEach((col) => {
      col.groups.forEach((g) => {
        g.ids.forEach((id) => {
          const d = findDeliverable(id, view);
          if (d) current[id] = statusOf(d.pct);
        });
      });
    });
    const prev = prevStatusesRef.current;
    if (prev) {
      const changed: Record<string, boolean> = {};
      let any = false;
      Object.keys(current).forEach((id) => {
        if (prev[id] !== undefined && prev[id] !== current[id]) {
          changed[id] = true;
          any = true;
        }
      });
      if (any) {
        setPopKeys((old) => {
          const next = { ...old };
          Object.keys(changed).forEach((id) => { next[id] = (next[id] || 0) + 1; });
          return next;
        });
      }
    }
    prevStatusesRef.current = current;
  }, [view]);

  useEffect(() => {
    if (!isPlaying) return;
    const idx = P1G_PLAY_SEQUENCE.indexOf(view);
    const startIdx = idx === -1 ? 0 : idx;
    if (startIdx >= P1G_PLAY_SEQUENCE.length - 1) return;
    const id = setTimeout(() => setView(P1G_PLAY_SEQUENCE[startIdx + 1]), P1G_PLAY_STEP_MS);
    return () => clearTimeout(id);
  }, [isPlaying, view]);

  useEffect(() => {
    if (isPlaying && view === P1G_PLAY_SEQUENCE[P1G_PLAY_SEQUENCE.length - 1]) {
      const id = setTimeout(() => setIsPlaying(false), P1G_PLAY_STEP_MS);
      return () => clearTimeout(id);
    }
  }, [isPlaying, view]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setView(P1G_PLAY_SEQUENCE[0]);
      setIsPlaying(true);
    }
  };

  const jumpTo = (v: ViewMode) => {
    setIsPlaying(false);
    setView(v);
  };

  return (
    <div className="doc doc-compact">
      <div className="tl-viewrow wbs-viewrow">
        <div className="tl-play-wrap">
          <div className="tl-play-note" aria-hidden="true">
            <span className="tl-play-note-text">click me</span>
            <svg viewBox="0 0 30 20" fill="none">
              <path d="M2 10 C 10 6, 18 6, 24 8" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 8 L 19 4.5 M24 8 L 20 12" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <button
            type="button"
            className={`tl-play-btn${isPlaying ? ' is-playing' : ''}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play through view states'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M4 2.5v11l10-5.5-10-5.5z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
        <div className="tl-toggle" role="tablist" aria-label="Phase 1 Goals view">
          <button
            role="tab"
            aria-selected={view === 'actual'}
            className={`tl-toggle-btn${view === 'actual' ? ' is-on' : ''}`}
            onClick={() => jumpTo('actual')}
          >
            Y1Q3
          </button>
          <button
            role="tab"
            aria-selected={view === 'y1q2'}
            className={`tl-toggle-btn${view === 'y1q2' ? ' is-on' : ''}`}
            onClick={() => jumpTo('y1q2')}
          >
            Y1Q2
          </button>
          <button
            role="tab"
            aria-selected={view === 'y1q1'}
            className={`tl-toggle-btn${view === 'y1q1' ? ' is-on' : ''}`}
            onClick={() => jumpTo('y1q1')}
          >
            Y1Q1
          </button>
          <button
            role="tab"
            aria-selected={view === 'ideal'}
            className={`tl-toggle-btn${view === 'ideal' ? ' is-on' : ''}`}
            onClick={() => jumpTo('ideal')}
          >
            PROPOSAL
          </button>
        </div>
      </div>

      <div className="wbs-legend wbs-legend-top">
        <span className="wbs-legend-item"><span className="wbs-dot green" />Complete</span>
        <span className="wbs-legend-item"><span className="wbs-dot yellow" />Ongoing</span>
        <span className="wbs-legend-hint">Statuses are pulled live from the Progress Timeline&apos;s deliverable data</span>
      </div>

      <div className="wbs-arrows" aria-hidden="true">
        <div className="wbs-arrows-line" />
        {WBS_COLUMNS.map((c) => <div className="wbs-arrow-drop" key={c.num} />)}
      </div>

      <div className="wbs-grid">
        {WBS_COLUMNS.map((c) => <WbsColumn col={c} view={view} popKeys={popKeys} key={c.num} />)}
      </div>
    </div>
  );
}

// ─── ComingSoon ───────────────────────────────────────────────────────────────

interface TabDef {
  id: string;
  label: string;
  num: string;
  status: 'live' | 'soon';
  blurb?: string;
  planned?: string[];
  Component?: React.FC;
}

function ComingSoon({ tab }: { tab: TabDef }) {
  return (
    <div className="soon-state">
      <div className="soon-icon">Coming soon</div>
      <h2>{tab.label}</h2>
      <p>{tab.blurb}</p>
      {tab.planned && (
        <div className="soon-planned">
          {tab.planned.map((p, i) => <span key={i} className="soon-chip">{p}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── HubShell ─────────────────────────────────────────────────────────────────

const TABS: TabDef[] = [
  { id: 'timeline', label: 'Progress Timeline', num: '01', status: 'live', Component: TimelineTab },
  { id: 'phase1breakdown', label: 'Phase 1 Goals', num: '02', status: 'live', Component: Phase1BreakdownTab },
];

export default function AUDProgressHub() {
  const [active, setActive] = useState<string>(() => {
    if (typeof window === 'undefined') return 'timeline';
    const h = (location.hash || '').replace('#', '');
    if (TABS.some((t) => t.id === h && t.status === 'live')) return h;
    try {
      const s = localStorage.getItem('aud-hub-tab');
      if (s && TABS.some((t) => t.id === s && t.status === 'live')) return s;
    } catch {}
    return 'timeline';
  });

  useEffect(() => {
    try { localStorage.setItem('aud-hub-tab', active); } catch {}
    if (location.hash.replace('#', '') !== active) {
      history.replaceState(null, '', '#' + active);
    }
  }, [active]);

  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];
  const Active = activeTab.Component;

  return (
    <div className="aud-root">
      <div className="hub">
        <div className="masthead">
          <div className="masthead-inner">
            <div className="mh-brand">
              <span className="mh-mark">AUD-Penn Operations Dashboard</span>
            </div>
            <div className="mh-meta">
              <span><span className="mh-dot" /></span>
              <span>Updated <strong>with Y1Q3 Report</strong></span>
            </div>
          </div>
          <nav className="tabnav">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`tab${t.id === active ? ' active' : ''}${t.status === 'soon' ? ' locked' : ''}`}
                onClick={() => t.status === 'live' && setActive(t.id)}
                aria-current={t.id === active ? 'page' : undefined}
              >
                <span className="tab-num">{t.num}</span>
                {t.label}
                {t.status === 'soon' && <span className="tab-soon">Soon</span>}
              </button>
            ))}
          </nav>
        </div>
        <div className="tab-body">
          {activeTab.status === 'live' && Active ? <Active /> : <ComingSoon tab={activeTab} />}
        </div>
      </div>
    </div>
  );
}
