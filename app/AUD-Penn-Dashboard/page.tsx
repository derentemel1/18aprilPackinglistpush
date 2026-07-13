'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
    <div className="axis">
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
  const idLabel = `${sub.id}${useActual ? ` · ${completionPct}%` : ''}`;
  const isNarrow = barW < 64;

  return (
    <div
      className={`sub-row${isActive ? ' active' : ''}`}
      onClick={onClick}
      style={{ '--row-i': rowIndex } as React.CSSProperties}
    >
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
          {!isNarrow && <span className="sub-bar-id">{idLabel}</span>}
        </div>
        {isNarrow && (
          <span className="sub-bar-id-outside" style={{ left: left + barW + 8 }}>{idLabel}</span>
        )}
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

  const TRACK_LEFT = 20;

  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth - 40;
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
      <div className="tl-list-note" aria-hidden="true">
        <span className="tl-play-note-text" />
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
            <div className="axis-track" style={{ width: trackWidth }}>
              <MonthAxis pxPerMonth={pxPerMonth} />
            </div>
          </div>

          {/* Year band */}
          <div className="year-band">
            <div className="year-track" style={{ width: trackWidth }}>
              {[1, 2, 3, 4].map((yr) => {
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

interface TimelineTabProps {
  hideControls?: boolean;
  view?: ViewMode;
}

function TimelineTab({ hideControls, view: controlledView }: TimelineTabProps = {}) {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [internalView, setInternalView] = useState<ViewMode>('actual');
  const view = hideControls && controlledView ? controlledView : internalView;
  const setView = setInternalView;
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
      {!hideControls && (
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
      )}

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

// ─── ProjectRoadTab ─────────────────────────────────────────────────────────
// Full 5-phase roadmap, reorganized as a traditional Gantt (one row per phase,
// overlapping start dates, milestone lines, live "today" marker). Phase 1 & 2 rows
// mirror data-model ids; Phases 3-5 are shown for structure/reference only.

type RoadColor = 'p1' | 'p2' | 'p3' | 'p4' | 'p5';
type RoadView = 'y1q1' | 'y1q2' | 'actual';

interface RoadSub {
  id: string;
  title: string;
  jump?: boolean;
}

interface RoadPhaseDef {
  id: string;
  color: RoadColor;
  label: string;
  name: string;
  takeaway: string;
  bullets: string[];
  main: [number, number];
  subs: RoadSub[];
}

interface OriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Month index 0 = October 2025 (same epoch as the Sub-Phase Timeline tab)
const ROW_BASE_YEAR = 2025;
const ROW_BASE_MONTH = 9; // October (0-indexed, Jan = 0)
const ROW_AXIS_END = 100; // Jan 2034

const ROAD_PHASES: RoadPhaseDef[] = [
  {
    id: 'P1',
    color: 'p1',
    label: 'Phase 1',
    name: 'Alliance Alignment, Project Mapping & Approval Submission',
    takeaway: 'Lays the policy & academic groundwork needed for approval.',
    bullets: [
      'Establishes **shared governance** & defines project roles, reporting, & timelines.',
      "Assesses AUD's **facilities, IT, and central services** for feasibility.",
      'Produces the **curriculum framework** and **clinical-partners** for submission.',
      'Submits to the **CAA & SACSCOC applications -** before the school can be built.',
    ],
    main: [0, 16],
    subs: [
      { id: '1.1', title: 'Strategic Partner Alignment, Logistics & Project Mapping', jump: true },
      { id: '1.2', title: 'Essential Materials Preparation & Approval Submission', jump: true },
      { id: '1.3', title: 'Admissions & Marketing Planning', jump: true },
    ],
  },
  {
    id: 'P2',
    color: 'p2',
    label: 'Phase 2',
    name: 'SOM Launch — Marketing, Admissions, Pre-Clinical Curriculum, Faculty',
    takeaway: 'Converts an approved plan into a functioning school.',
    bullets: [
      'Finalizes the **SOM leadership team**.',
      'Runs the **first admissions cycle** and selects the inaugural class.',
      'Builds all **pre-clinical** course content',
      'Recruits and onboards **founding core faculty**.',
    ],
    main: [12, 80],
    subs: [
      { id: '2.1', title: 'Finalizing the School Leadership Team', jump: true },
      { id: '2.2', title: 'Admission Process & Student Selection', jump: true },
      { id: '2.3', title: 'Pre-Clinical Course Material & Faculty Selection', jump: true },
      { id: '2.4', title: 'Faculty & Staff Professional Development', jump: true },
    ],
  },
  {
    id: 'P3',
    color: 'p3',
    label: 'Phase 3',
    name: 'Initiation of Medical School Classes & Preparation for the Clinical Phase',
    takeaway: 'Opens the doors and prepares for clinical training.',
    bullets: [
      'The **first class begins** pre-clinical coursework.',
      '**Clinical rotation sites** are selected and onboarded.',
      'Clerkship Directors are trained through the **Clinical Educator Academy**.',
    ],
    main: [28, 80],
    subs: [
      { id: '3A', title: 'Initiation of Pre-Clinical Coursework' },
      { id: '3B', title: 'Developing Clinical Cores & Rotation Sites' },
      { id: '3C', title: 'Selecting & Developing Clinical Educators & Clerkship Directors' },
    ],
  },
  {
    id: 'P4',
    color: 'p4',
    label: 'Phase 4',
    name: 'Clinical Implementation & Advancing Medically Related Research',
    takeaway: 'Puts students into clinical practice and builds research capacity.',
    bullets: [
      'Students enter **core clerkships and elective rotations**.',
      'Includes rotations at **Penn Medicine** itself.',
      'Stands up a **research strategic plan** for AUD-SOM.',
    ],
    main: [46, 80],
    subs: [
      { id: '4A', title: 'Deliver Core Clerkships & Clinical Competency Assessment' },
      { id: '4B', title: 'Develop & Deliver Elective Clinical Rotations' },
      { id: '4C', title: 'Promoting Medical Research at AUD' },
    ],
  },
  {
    id: 'P5',
    color: 'p5',
    label: 'Phase 5',
    name: 'Assessment, Accreditation & Expanding the AUD Brand',
    takeaway: 'Certifies the school and charts its growth.',
    bullets: [
      'Prepares graduates for **licensing exams**.',
      'Accompanies **international accreditation** (self-study, mock visit, site review).',
      "Charts growth — larger class sizes, **3+4 admissions, joint degrees** — extending AUD's brand across Penn.",
    ],
    main: [40, 100],
    subs: [
      { id: '5A', title: 'Student Assessment & Career Progression' },
      { id: '5B', title: 'Institutional Assessment & Accreditation' },
      { id: '5C', title: 'Expanding AUD Programs & Brand' },
    ],
  },
];

interface RoadMilestone {
  month: number;
  label: string;
  dateLabel: string;
}

const ROAD_MILESTONES: RoadMilestone[] = [
  { month: 13, label: 'SOM APPROVED', dateLabel: 'October 2026' },
  { month: 30, label: 'Class Admitted', dateLabel: 'March 2028' },
  { month: 36, label: 'SOM BEGINS', dateLabel: 'September 2028' },
  { month: 60, label: 'CLERKSHIPS BEGIN', dateLabel: 'September 2030' },
  { month: 80, label: 'GRADUATION', dateLabel: 'May 2032' },
  { month: 97, label: 'SOM Accredited', dateLabel: 'July 2033' },
];

const ROAD_PLAY_SEQUENCE: RoadView[] = ['y1q1', 'y1q2', 'actual'];
const ROAD_PLAY_STEP_MS = 2000;

const PHASE1_COMPLETION: Record<RoadView, number> = {
  y1q1: 0.23,
  y1q2: 0.30,
  actual: 0.39, // Y1Q3 — cumulative effort spend
};

interface PhaseBudget {
  id: string;
  color: RoadColor;
  label: string;
  amount: number;
}

const PHASE_BUDGETS: PhaseBudget[] = [
  { id: 'P1', color: 'p1', label: 'Phase 1', amount: 1267434 },
  { id: 'P2', color: 'p2', label: 'Phase 2', amount: 5515960 },
  { id: 'P3', color: 'p3', label: 'Phase 3', amount: 4777600 },
  { id: 'P4', color: 'p4', label: 'Phase 4', amount: 2832600 },
  { id: 'P5', color: 'p5', label: 'Phase 5', amount: 698000 },
];

const PROJECT_COMPLETION: Record<RoadView, number> = {
  y1q1: 0.0184,
  y1q2: 0.0240,
  actual: 0.0306, // Y1Q3 — cumulative project effort complete
};

const VIEW_LABELS: Record<RoadView, string> = {
  y1q1: 'Y1Q1',
  y1q2: 'Y1Q2',
  actual: 'Y1Q3',
};

function boldify(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

const MONTH_ABBR3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function axisMonth(m: number) {
  const total = ROW_BASE_MONTH + m;
  const month = total % 12;
  return MONTH_ABBR3[month];
}
function pctOf(m: number) {
  return (m / ROW_AXIS_END) * 100;
}

function PhaseBudgetChart({
  view,
  openId,
  onToggle,
}: {
  view: RoadView;
  openId: string | null;
  onToggle: (id: string, el?: HTMLElement) => void;
}) {
  const total = PHASE_BUDGETS.reduce((sum, p) => sum + p.amount, 0);
  const completion = PROJECT_COMPLETION[view] || 0;
  return (
    <div className="road-budget-stack-wrap">
      <div className="road-budget-stack">
        {PHASE_BUDGETS.map((p) => (
          <div
            key={p.id}
            className={`road-budget-seg road-${p.color}${openId === p.id ? ' is-open' : ''}`}
            style={{ width: (p.amount / total) * 100 + '%' }}
            role="button"
            tabIndex={0}
            onClick={(e) => onToggle(p.id, e.currentTarget)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(p.id, e.currentTarget); }}
          >
            <span className="road-budget-seg-label">{p.label}</span>
          </div>
        ))}
        <div className="road-budget-remain" style={{ left: `${completion * 100}%` }} />
      </div>
    </div>
  );
}

interface RoadActiveMarker {
  month: number;
  label: string;
  dateLabel: string;
  isToday?: boolean;
}

function RoadGanttRows({
  openId,
  onToggle,
  view,
}: {
  openId: string | null;
  onToggle: (id: string, el?: HTMLElement) => void;
  view: RoadView;
}) {
  const ticks: number[] = [];
  for (let m = 0; m <= ROW_AXIS_END; m++) {
    const calMonth = (ROW_BASE_MONTH + m) % 12;
    if (calMonth === 9 || calMonth === 0 || calMonth === 3 || calMonth === 6) ticks.push(m); // Oct, Jan, Apr, Jul
  }

  const gridRef = useRef<HTMLDivElement>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [activeMarker, setActiveMarker] = useState<RoadActiveMarker | null>(null);

  // Live "today" marker — recomputed from the real date, refreshed hourly
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 3600 * 1000);
    return () => clearInterval(id);
  }, []);
  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const todayOffset =
    (now.getFullYear() - ROW_BASE_YEAR) * 12 + (now.getMonth() - ROW_BASE_MONTH) +
    (now.getDate() - 1) / daysInMonth(now);
  const showToday = todayOffset >= 0 && todayOffset <= ROW_AXIS_END;

  const onTrackMove = (e: React.MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < 0 || x > rect.width) { setHoverPct(null); setActiveMarker(null); return; }
    const pct = (x / rect.width) * 100;
    setHoverPct(pct);
    // Snap to the nearest milestone within ~8px
    let near: RoadActiveMarker | null = null, best = 8.5;
    for (const mk of ROAD_MILESTONES) {
      const mkPct = pctOf(mk.month);
      const d = Math.abs(x - (mkPct / 100) * rect.width);
      if (d <= best) { best = d; near = mk; }
    }
    if (showToday) {
      const tPct = pctOf(todayOffset);
      const d = Math.abs(x - (tPct / 100) * rect.width);
      if (d <= best) { best = d; near = { month: todayOffset, label: 'Today', dateLabel: 'Today', isToday: true }; }
    }
    setActiveMarker(near);
  };
  const hoverMonth = hoverPct == null ? 0 : (hoverPct / 100) * ROW_AXIS_END;

  return (
    <div className="road-rows-wrap">
      <div className="road-rows-axis">
        {ticks.map((m) => (
          <div key={m} className="road-axis-tick" style={{ left: `${pctOf(m)}%` }}>
            <span className="road-axis-tick-label">{axisMonth(m)}</span>
          </div>
        ))}
      </div>

      <div className="road-year-track">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((yr) => {
          const start = (yr - 1) * 12;
          if (start >= ROW_AXIS_END) return null;
          const end = Math.min(start + 12, ROW_AXIS_END);
          return (
            <div key={yr} className="road-year-cell" style={{ left: `${pctOf(start)}%`, width: `${pctOf(end - start)}%` }}>
              <span className="road-year-label">Year {yr}</span>
            </div>
          );
        })}
      </div>

      <div
        className="road-rows-grid"
        ref={gridRef}
        onMouseMove={onTrackMove}
        onMouseLeave={() => { setHoverPct(null); setActiveMarker(null); }}
      >
        {/* vertical gridlines at each tick */}
        {ticks.map((m) => (
          <div key={m} className="road-gridline" style={{ left: `${pctOf(m)}%` }} />
        ))}

        {ROAD_PHASES.map((phase) => {
          const isOpen = openId === phase.id;
          const p1Completion = phase.id === 'P1' ? (PHASE1_COMPLETION[view] || 0) : 0;
          return (
            <div
              key={phase.id}
              className={`road-row road-${phase.color}${isOpen ? ' is-open' : ''}`}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={(e) => onToggle(phase.id, e.currentTarget)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(phase.id); }}
            >
              <div
                className="road-bar road-bar-main"
                style={{ left: `${pctOf(phase.main[0])}%`, width: `${pctOf(phase.main[1] - phase.main[0])}%` }}
              >
                <span className="road-bar-label">
                  {phase.label}{phase.id === 'P1' ? `: ${Math.round(p1Completion * 100)}%` : ''}
                </span>
                {phase.id === 'P1' && (
                  <div className="road-bar-remain" style={{ left: `${p1Completion * 100}%` }} />
                )}
                {phase.id !== 'P1' && (
                  <div className="road-bar-remain" style={{ left: '0%' }} />
                )}
                {phase.id !== 'P1' && <div className="road-bar-hatch-full" />}
              </div>
              {phase.id === 'P1' && (
                <span
                  className="road-bar-completion-tag"
                  style={{ left: `calc(${pctOf(phase.main[0])}% + ${p1Completion * pctOf(phase.main[1] - phase.main[0])}%)` }}
                >
                  {Math.round(p1Completion * 100)}% complete
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* milestone dashed lines — full-height overlay across axis + year band + rows */}
      {ROAD_MILESTONES.map((mk) => (
        <div key={mk.label} className="road-milestone-line" style={{ left: `${pctOf(mk.month)}%` }} />
      ))}

      {/* live "today" line */}
      {showToday && (
        <div className="road-today-line" style={{ left: `${pctOf(todayOffset)}%` }} />
      )}

      {/* hover playhead — same visual language as Progress Timeline */}
      {hoverPct != null && (
        <div
          className={`timeline-playhead${activeMarker ? (activeMarker.isToday ? ' ph-today' : ' ph-milestone') : ''}`}
          style={{ left: `${activeMarker ? pctOf(activeMarker.month) : hoverPct}%` }}
        >
          <div className="playhead-flag">
            {activeMarker ? (
              <>
                <span className="ph-month">{activeMarker.dateLabel}</span>
                <span className="ph-sub">{activeMarker.label}</span>
              </>
            ) : (
              <span className="ph-month">
                {axisMonth(Math.round(hoverMonth))} {ROW_BASE_YEAR + Math.floor((ROW_BASE_MONTH + hoverMonth) / 12)}
              </span>
            )}
          </div>
          <div className="playhead-line" />
        </div>
      )}
    </div>
  );
}

function RoadOverlayCard({
  phase,
  originRect,
  onClose,
}: {
  phase: RoadPhaseDef;
  originRect: OriginRect | null;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (!originRect) { card.style.opacity = '1'; return; }
    const parent = card.offsetParent as HTMLElement | null;
    if (!parent) return;
    const cr = card.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    const cardLeft = cr.left - pr.left;
    const cardTop = cr.top - pr.top;
    const scaleX = Math.max(originRect.width / cr.width, 0.05);
    const scaleY = Math.max(originRect.height / cr.height, 0.05);
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    const cardCenterX = cardLeft + cr.width / 2;
    const cardCenterY = cardTop + cr.height / 2;
    const dx = originCenterX - cardCenterX;
    const dy = originCenterY - cardCenterY;
    card.style.transition = 'none';
    card.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scaleX}, ${scaleY})`;
    card.style.opacity = '0';
    requestAnimationFrame(() => {
      card.style.transition = 'transform 0.32s cubic-bezier(.2,.8,.2,1), opacity 0.22s ease';
      card.style.transform = 'translate(-50%, -50%) scale(1,1)';
      card.style.opacity = '1';
    });
  }, [originRect]);

  return (
    <div className={`road-overlay-card road-${phase.color}`} ref={cardRef}>
      <button type="button" className="road-overlay-close" aria-label="Close" onClick={onClose}>
        <svg viewBox="0 0 14 14" width="13" height="13">
          <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <div className="road-subpanel-head">
        <span className="road-subpanel-label">{phase.label}</span>
        <span className="road-subpanel-name">{phase.name}</span>
      </div>
      <p className="road-impact-takeaway">{phase.takeaway}</p>
      <ul className="road-impact-list">
        {phase.bullets.map((b, i) => (
          <li key={i}>{boldify(b)}</li>
        ))}
      </ul>
    </div>
  );
}

function ProjectRoadTab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [originRect, setOriginRect] = useState<OriginRect | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<RoadView>('actual');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const currentIdx = ROAD_PLAY_SEQUENCE.indexOf(view);
    const startIdx = currentIdx === -1 ? 0 : currentIdx;
    if (startIdx >= ROAD_PLAY_SEQUENCE.length - 1) return;
    const id = setTimeout(() => setView(ROAD_PLAY_SEQUENCE[startIdx + 1]), ROAD_PLAY_STEP_MS);
    return () => clearTimeout(id);
  }, [isPlaying, view]);

  useEffect(() => {
    if (isPlaying && view === ROAD_PLAY_SEQUENCE[ROAD_PLAY_SEQUENCE.length - 1]) {
      const id = setTimeout(() => setIsPlaying(false), ROAD_PLAY_STEP_MS);
      return () => clearTimeout(id);
    }
  }, [isPlaying, view]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setView(ROAD_PLAY_SEQUENCE[0]);
      setIsPlaying(true);
    }
  };

  const jumpToView = (v: RoadView) => {
    setIsPlaying(false);
    setView(v);
  };

  const toggle = (id: string, rowEl?: HTMLElement) => {
    if (openId === id) { setOpenId(null); return; }
    if (rowEl && wrapRef.current) {
      const originEl = (rowEl.querySelector('.road-bar-main') as HTMLElement) || rowEl;
      const br = originEl.getBoundingClientRect();
      const wr = wrapRef.current.getBoundingClientRect();
      setOriginRect({ left: br.left - wr.left, top: br.top - wr.top, width: br.width, height: br.height });
    }
    setOpenId(id);
  };

  return (
    <div className="doc doc-compact">
      <div className="tl-viewrow tl-viewrow-hero">
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
        <div className="tl-toggle" role="tablist" aria-label="Roadmap view">
          <button
            role="tab"
            aria-selected={view === 'y1q1'}
            className={`tl-toggle-btn${view === 'y1q1' ? ' is-on' : ''}`}
            onClick={() => jumpToView('y1q1')}
          >
            Y1Q1
          </button>
          <button
            role="tab"
            aria-selected={view === 'y1q2'}
            className={`tl-toggle-btn${view === 'y1q2' ? ' is-on' : ''}`}
            onClick={() => jumpToView('y1q2')}
          >
            Y1Q2
          </button>
          <button
            role="tab"
            aria-selected={view === 'actual'}
            className={`tl-toggle-btn${view === 'actual' ? ' is-on' : ''}`}
            onClick={() => jumpToView('actual')}
          >
            Y1Q3
            <span className="tl-toggle-latest">Latest</span>
          </button>
        </div>
      </div>

      <div className="road-legend road-legend-top">
        <span className="road-legend-item"><span className="road-legend-swatch road-legend-repeat" style={{ backgroundColor: '#121111' }} />Primary Effort</span>
        <span className="road-legend-item"><span className="road-legend-swatch road-legend-hatch" style={{ backgroundColor: '#959090' }} />Accompaniment &amp; Coaching</span>
        <span className="road-legend-item"><span className="road-legend-swatch road-legend-incomplete" />Incomplete</span>
      </div>

      <h2 className="road-title">How far along is the project now?</h2>
      <p className="road-answer">
        As of {VIEW_LABELS[view]}: <strong>{((PROJECT_COMPLETION[view] || 0) * 100).toFixed(2)}%</strong> of total project effort is complete.
      </p>
      <PhaseBudgetChart view={view} openId={openId} onToggle={toggle} />

      <h2 className="road-title road-subtitle-spaced">How far along is each phase?</h2>
      <p className="road-answer">
        As of {VIEW_LABELS[view]}: <strong>Phase 1 is {Math.round((PHASE1_COMPLETION[view] || 0) * 100)}% complete</strong> — Phases 2–5 have not yet started.
      </p>
      <div className="road-rows-overlay-wrap" ref={wrapRef}>
        <RoadGanttRows openId={openId} onToggle={toggle} view={view} />

        {ROAD_PHASES.map((phase) =>
          openId === phase.id ? (
            <RoadOverlayCard phase={phase} originRect={originRect} onClose={() => setOpenId(null)} key={phase.id} />
          ) : null
        )}
      </div>

      <h2 className="road-title road-subtitle-spaced">How far along is each sub-phase?</h2>
      <TimelineTab hideControls view={view} />
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
        <span className="wbs-legend-item" />
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
  { id: 'project-road', label: 'Project Roadmap', num: '01', status: 'live', Component: ProjectRoadTab },
  { id: 'phase1breakdown', label: 'Phase 1 DeepDive', num: '03', status: 'live', Component: Phase1BreakdownTab },
];

export default function AUDProgressHub() {
  const [active, setActive] = useState<string>(() => {
    if (typeof window === 'undefined') return 'project-road';
    const h = (location.hash || '').replace('#', '');
    if (TABS.some((t) => t.id === h && t.status === 'live')) return h;
    try {
      const s = localStorage.getItem('aud-hub-tab');
      if (s && TABS.some((t) => t.id === s && t.status === 'live')) return s;
    } catch {}
    return 'project-road';
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
