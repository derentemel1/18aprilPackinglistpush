'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
        actual: { start: 0, end: 9 },
        cost: 522025, contingency: 0, trips: 5,
        oneliner: 'Define partner roles, governance, working teams, feasibility, accreditation pathway and clinical-site candidates.',
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
          { id: '1.1i', text: 'Phase Workplan & Cost Analysis Updated', pct: 44.55 },
        ],
      },
      {
        id: '1.2',
        title: 'Essential Materials Preparation & Approval Submission',
        start: 3, min: 9, max: 12,
        actual: { start: 6, end: 18 },
        cost: 809966, contingency: 56800, trips: 7,
        oneliner: 'Build the SOM administrative + curriculum framework and submit for UAE Ministry / CAA / SACSCOC approval.',
        snapshot: { completion: 0, charges: 0, remainder: 809966, itemTotal: 809966, burn: 0 },
        deliverables: [
          { id: '1.2a', text: 'SOM Leadership structure finalized', pct: 0 },
          { id: '1.2b', text: 'Governance committees established', pct: 0 },
          { id: '1.2c', text: 'Clinical MOUs executed', pct: 0 },
          { id: '1.2d', text: 'MD curriculum framework approved', pct: 0 },
          { id: '1.2e', text: 'CAA application submitted', pct: 0 },
          { id: '1.2f', text: 'SACSCOC package submitted', pct: 0 },
        ],
      },
      {
        id: '1.3',
        title: 'Admissions & Marketing Planning',
        start: 12, min: 1, max: 2,
        cost: 43443, contingency: 0, trips: 0,
        oneliner: 'Pre-launch admissions design — standards, decision process, logistics, recruitment cadence.',
        snapshot: { completion: 0, charges: 0, remainder: 43443, itemTotal: 43443, burn: 0 },
        deliverables: [
          { id: '1.3a', text: 'Admissions policy approved', pct: 0 },
          { id: '1.3b', text: 'Admissions Committee appointed', pct: 0 },
          { id: '1.3c', text: 'Admissions process documented', pct: 0 },
          { id: '1.3d', text: 'Penn role in admissions defined', pct: 0 },
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

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtUSD(n: number): string {
  const isWhole = Math.abs(n - Math.round(n)) < 0.005;
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  });
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
  view: 'actual' | 'ideal';
  rowIndex: number;
}

function SubphaseBar({ sub, phaseColor, pxPerMonth, isActive, onClick, view, rowIndex }: SubphaseBarProps) {
  const idealStart = sub.start;
  const idealEnd = sub.start + sub.max;
  const actual = sub.actual ?? { start: idealStart, end: idealEnd };
  const useActual = view === 'actual';

  const barStart = useActual ? actual.start : idealStart;
  const barEnd = useActual ? actual.end : idealEnd;
  const left = barStart * pxPerMonth;
  const barW = (barEnd - barStart) * pxPerMonth;

  const slip = useActual ? actual.end - idealEnd : 0;
  const hasSlip = slip > 0.01;

  const completion = sub.snapshot?.completion ?? 0;
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
          {useActual && (
            <div className="sub-bar-remain" style={{ left: `${completion * 100}%` }} />
          )}
          {useActual && completion > 0 && completion < 1 && (
            <div className="sub-bar-fillline" style={{ left: `${completion * 100}%` }} />
          )}
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
  view: 'actual' | 'ideal';
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

function SnapshotCards({ sub }: { sub: Subphase }) {
  const pg = sub.snapshot;
  const pct = (n: number) => (n * 100).toFixed(n === 0 ? 0 : 2) + '%';
  const rag = (n: number) => (n >= 0.67 ? 'green' : n >= 0.34 ? 'yellow' : 'red');
  return (
    <div className="snapshot">
      <div className="snap-grid">
        <div className="snap-card snap-pct">
          <div className="snap-label">Completion rate</div>
          <div className="snap-pct-row">
            <span className={`snap-dot ${rag(pg.completion)}`} />
            <span className="snap-big">{pct(pg.completion)}</span>
          </div>
        </div>
        <div className="snap-card snap-pct">
          <div className="snap-label">Budget burn</div>
          <div className="snap-pct-row">
            <span className={`snap-dot ${rag(pg.burn)}`} />
            <span className="snap-big">{pct(pg.burn)}</span>
          </div>
        </div>
        <div className="snap-card snap-total">
          <div className="snap-label">Sub-phase budget</div>
          <div className="snap-money">{fmtUSD(pg.itemTotal)}</div>
        </div>
        <div className="snap-card">
          <div className="snap-label">Billed to date</div>
          <div className="snap-money">{fmtUSD(pg.charges)}</div>
        </div>
        <div className="snap-card">
          <div className="snap-label">Budget left</div>
          <div className="snap-money">{fmtUSD(pg.remainder)}</div>
        </div>
        <div className="snap-card">
          <div className="snap-label">Trips completed</div>
          <div className="snap-money">{`${pg.tripsDone ?? 0} of ${sub.trips}`}</div>
        </div>
      </div>
    </div>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

function DetailPanel({ activeSubId, onClose }: { activeSubId: string | null; onClose: () => void }) {
  let sub: Subphase | null = null;
  let phase: Phase | null = null;
  for (const p of PHASES) {
    const s = p.subphases.find((x) => x.id === activeSubId);
    if (s) { sub = s; phase = p; break; }
  }
  if (!sub || !phase) return null;

  return (
    <div className="detail-panel is-overlay" role="dialog" aria-label={`Sub-phase ${sub.id} detail`}>
      <div className="dp-header">
        <div className="dp-head-left">
          <span className={`dp-tag dp-tag-${phase.color}`}>{sub.id}</span>
          <h2 className="dp-title">{sub.title}</h2>
        </div>
        <button className="dp-close" onClick={onClose} aria-label="Close detail">×</button>
      </div>

      {sub.snapshot && <SnapshotCards sub={sub} />}

      <div className="dp-section-title">Key deliverables</div>
      <ol className="dp-deliverables">
        {sub.deliverables.map((d, i) => {
          const pct = typeof d.pct === 'number' ? d.pct : null;
          const rag = pct === null ? null : pct >= 67 ? 'green' : pct >= 34 ? 'yellow' : 'red';
          return (
            <li key={i}>
              <span className="dp-d-num">{d.id}</span>
              <span className="dp-d-body">
                <span className="dp-d-text">{d.text}</span>
              </span>
              {pct !== null && (
                <span className="dp-d-status">
                  <span className={`dp-d-dot ${rag}`} />
                  <span className={`dp-d-pct${pct === 0 ? ' is-zero' : ''}`}>
                    {Number.isInteger(pct) ? pct : pct.toFixed(2)}%
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── TimelineTab ──────────────────────────────────────────────────────────────

function TimelineTab() {
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [view, setView] = useState<'actual' | 'ideal'>('actual');

  return (
    <div className="doc doc-compact">
      <div className="tl-bar">
        <div className="tl-bar-left">
          <span className="kicker"></span>
          <h1 className="tl-bar-title">Timelines &amp; Progress Snapshots</h1>
        </div>
      </div>

      <div className="tl-viewrow">
        <div className="tl-toggle" role="tablist" aria-label="Timeline view">
          <button
            role="tab"
            aria-selected={view === 'actual'}
            className={`tl-toggle-btn${view === 'actual' ? ' is-on' : ''}`}
            onClick={() => setView('actual')}
          >
            Actual
          </button>
          <button
            role="tab"
            aria-selected={view === 'ideal'}
            className={`tl-toggle-btn${view === 'ideal' ? ' is-on' : ''}`}
            onClick={() => setView('ideal')}
          >
            ORIGINAL ESTIMATE
          </button>
        </div>
        <span className="tl-viewrow-note">
          {view === 'ideal' ? 'As written in SOW1 October 2025' : ''}
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
          <DetailPanel activeSubId={activeSubId} onClose={() => setActiveSubId(null)} />
        </div>
      </div>

      <footer className="doc-footer">
        <span>Source · Redline_v2_AUD_PennMed_SOW.Final · October 2025</span>
        <span>Click any sub-phase bar in the timeline for full deliverables.</span>
      </footer>
    </div>
  );
}

// ─── Org Chart Data ───────────────────────────────────────────────────────────

const ORG_QUARTERS = ['Q2 2027','Q3 2027','Q4 2027','Q1 2028','Q2 2028','Q3 2028','Q4 2028','2029+'];

function shiftQuarter(q: string, n: number): string {
  if (q === 'Existing') return 'Existing';
  const i = ORG_QUARTERS.indexOf(q);
  if (i < 0) return q;
  return ORG_QUARTERS[Math.min(i + n, ORG_QUARTERS.length - 1)];
}

function yearOf(q: string): string {
  if (q === 'Existing') return 'existing';
  if (q.includes('2027')) return 'y2027';
  if (q.includes('2028')) return 'y2028';
  return 'y2029';
}

const BUCKET: Record<string, { fill: string; label: string }> = {
  existing: { fill: '#33485f', label: 'Existing role' },
  y2027:    { fill: '#3C6EB4', label: '2027 hire' },
  y2028:    { fill: '#5A8E3E', label: '2028 hire' },
  y2029:    { fill: '#C55A11', label: '2029+ hire' },
};

interface RawBox {
  id: string;
  parent: string | null;
  label: string;
  x: number; y: number; w: number; h: number;
  q: string;
  context?: boolean;
  staff?: boolean;
}

const RAW_BOXES: RawBox[] = [
  { id: 'provost',       parent: null,           label: 'Provost',                                          x:6.36, y:0.32, w:1.22, h:0.45, q:'Existing', context:true },
  { id: 'dean',          parent: 'provost',       label: 'Dean of School of Medicine',                       x:5.72, y:1.19, w:2.51, h:0.40, q:'Existing' },
  { id: 'adminAsst',     parent: 'dean',          label: 'Administrative Assistant',                         x:4.10, y:1.83, w:1.66, h:0.27, q:'Existing', staff:true },
  { id: 'vdume',         parent: 'dean',          label: 'Vice Dean, Undergraduate Medical Education',       x:0.67, y:2.82, w:5.53, h:0.86, q:'Existing' },
  { id: 'adFaculty',     parent: 'dean',          label: 'Associate Dean, Faculty Affairs',                  x:6.33, y:2.84, w:1.38, h:0.81, q:'Q2 2028' },
  { id: 'adAssess',      parent: 'dean',          label: 'Associate Dean, Assessment & Program Development', x:7.88, y:2.86, w:1.38, h:0.81, q:'Q4 2028' },
  { id: 'dirAdmin',      parent: 'dean',          label: 'Director, Administration',                         x:9.40, y:2.84, w:1.38, h:0.81, q:'Q4 2027' },
  { id: 'adResearch',    parent: 'dean',          label: 'Associate Dean, Research',                         x:10.89,y:2.85, w:1.04, h:0.81, q:'2029+' },
  { id: 'deptChairs',    parent: 'dean',          label: 'Department Chairs / Heads',                        x:12.06,y:2.85, w:1.04, h:0.82, q:'2029+' },
  { id: 'vdAdmin',       parent: 'vdume',         label: 'Admin',                                            x:0.17, y:3.72, w:0.43, h:0.23, q:'Q3 2027', staff:true },
  { id: 'dirCurr',       parent: 'vdume',         label: 'Director, Curriculum',                             x:0.35, y:4.06, w:1.16, h:0.50, q:'Q2 2028' },
  { id: 'dirAdmissions', parent: 'vdume',         label: 'Director, Admissions',                             x:1.76, y:4.06, w:1.16, h:0.50, q:'Q3 2027' },
  { id: 'adStudent',     parent: 'vdume',         label: 'Associate Dean, Student Affairs',                  x:3.17, y:4.06, w:1.16, h:0.50, q:'Q4 2028' },
  { id: 'dirSim',        parent: 'vdume',         label: 'Director, Simulation & Education Technology',      x:4.59, y:4.06, w:1.58, h:0.51, q:'Q4 2028' },
  { id: 'if',            parent: 'dirCurr',       label: 'Associate Director, IF',                           x:0.57, y:4.76, w:1.00, h:0.41, q:'Q4 2028' },
  { id: 'ccp',           parent: 'dirCurr',       label: 'Associate Director, CCP',                          x:0.56, y:5.26, w:1.00, h:0.41, q:'2029+' },
  { id: 'pcp',           parent: 'dirCurr',       label: 'Associate Director, PCP',                          x:0.56, y:5.75, w:1.00, h:0.41, q:'2029+' },
  { id: 'finAid',        parent: 'dirAdmissions', label: 'Associate Director, Financial Aid',                x:1.99, y:4.71, w:0.89, h:0.37, q:'Q3 2027' },
  { id: 'coaching',      parent: 'adStudent',     label: 'Director, Coaching',                               x:3.37, y:4.71, w:0.97, h:0.37, q:'Q4 2028' },
  { id: 'advising',      parent: 'adStudent',     label: 'Director, Student Advising',                       x:3.36, y:5.20, w:0.98, h:0.63, q:'Q4 2028' },
  { id: 'studentSvc',    parent: 'adStudent',     label: 'Student Services: Health · Counseling · Disability',x:3.36,y:5.95, w:1.41, h:0.80, q:'2029+' },
  { id: 'facAdmin',      parent: 'adFaculty',     label: 'Admin',                                            x:6.73, y:3.72, w:0.44, h:0.23, q:'Q2 2028', staff:true },
  { id: 'facDev',        parent: 'adFaculty',     label: 'Director, Faculty & Resident Development',         x:6.72, y:4.06, w:1.00, h:0.71, q:'Q2 2028' },
  { id: 'coi',           parent: 'adFaculty',     label: 'Administrator, COI & Faculty Conduct',             x:6.72, y:4.88, w:1.00, h:0.71, q:'Q4 2028' },
  { id: 'apptPromo',     parent: 'adFaculty',     label: 'Administrator, Appointments & Promotions',         x:6.71, y:5.68, w:1.00, h:0.71, q:'Q4 2028' },
  { id: 'assessAdmin',   parent: 'adAssess',      label: 'Admin',                                            x:8.27, y:3.74, w:0.47, h:0.23, q:'Q2 2028', staff:true },
  { id: 'eduData',       parent: 'adAssess',      label: 'Director, Educational Data & Analytics',           x:8.29, y:4.11, w:1.00, h:0.71, q:'Q3 2028' },
  { id: 'assessEval',    parent: 'adAssess',      label: 'Director, Assessment & Evaluation',                x:8.29, y:4.97, w:1.00, h:0.71, q:'Q4 2028' },
  { id: 'dirAdminAdmin', parent: 'dirAdmin',      label: 'Admin',                                            x:9.78, y:3.73, w:0.47, h:0.23, q:'Q4 2027', staff:true },
  { id: 'central',       parent: 'dirAdmin',      label: 'Central Services: Registrar · Facilities · Finance · Library · IT', x:9.78,y:4.05,w:1.16,h:1.15,q:'Existing' },
];

const ORG_SCALE = 96;
const ORG_W = 13.333 * ORG_SCALE;
const ORG_H = 7.10 * ORG_SCALE;
const ORG_STEPS = ['Baseline', ...ORG_QUARTERS];

function buildScenario(shift: number) {
  return RAW_BOXES.map((b) => {
    const q = shift === 0 ? b.q : shiftQuarter(b.q, shift);
    return { ...b, quarter: q, bucket: yearOf(q) };
  });
}

const SCENARIOS: Record<string, { key: string; name: string; boxes: (RawBox & { quarter: string; bucket: string })[]; insights: string[] }> = {
  ideal: {
    key: 'ideal', name: 'Ideal Timeline',
    boxes: buildScenario(0),
    insights: [
      'Front-loads core leadership to drive approvals, hiring, and launch planning.',
      'Places curriculum and assessment roles early enough to shape program design.',
      'Builds operations before launch to reduce execution risk.',
      'Defers specialized roles until enrollment and program complexity justify them.',
    ],
  },
  failsafe: {
    key: 'failsafe', name: 'Failsafe Timeline',
    boxes: buildScenario(1),
    insights: [
      'Shifts most hires by ~1 quarter to absorb approval and onboarding delays.',
      'Protects launch readiness by preserving core leadership and curriculum capacity.',
      'Moves student-facing roles closer to enrollment.',
      'Defers non-launch-critical specialty roles to 2029+.',
    ],
  },
};

// ─── OrgChartTab ──────────────────────────────────────────────────────────────

function OrgChartTab() {
  const [scenarioKey, setScenarioKey] = useState<string>(() => {
    try { return localStorage.getItem('aud-org-scenario') || 'ideal'; } catch { return 'ideal'; }
  });
  const [step, setStep] = useState<number>(() => {
    try { return Math.min(ORG_STEPS.length - 1, Math.max(0, +(localStorage.getItem('aud-org-step') || 0))); } catch { return 0; }
  });
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const scenario = SCENARIOS[scenarioKey];

  useEffect(() => { try { localStorage.setItem('aud-org-scenario', scenarioKey); } catch {} }, [scenarioKey]);
  useEffect(() => { try { localStorage.setItem('aud-org-step', String(step)); } catch {} }, [step]);

  useEffect(() => {
    const measure = () => {
      if (!wrapRef.current) return;
      setScale(Math.min(1, wrapRef.current.clientWidth / ORG_W));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= ORG_STEPS.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => Math.min(ORG_STEPS.length - 1, s + 1)), 1150);
    return () => clearTimeout(t);
  }, [playing, step]);

  const curQuarterIdx = step - 1;

  const isActive = useCallback((box: typeof scenario.boxes[0]) => {
    if (box.bucket === 'existing') return true;
    return ORG_QUARTERS.indexOf(box.quarter) <= curQuarterIdx;
  }, [curQuarterIdx]);

  const justActivated = useCallback((box: typeof scenario.boxes[0]) => {
    if (box.bucket === 'existing') return step === 0;
    return ORG_QUARTERS.indexOf(box.quarter) === curQuarterIdx;
  }, [curQuarterIdx, step]);

  const S = ORG_SCALE;
  const px = (b: RawBox) => ({ l: b.x * S, t: b.y * S, w: b.w * S, h: b.h * S, cx: (b.x + b.w / 2) * S, bot: (b.y + b.h) * S, top: b.y * S });

  const byId = useMemo(() => {
    const m: Record<string, RawBox> = {};
    RAW_BOXES.forEach((b) => (m[b.id] = b));
    return m;
  }, []);

  const connectors = useMemo(() => {
    const paths: { id: string; d: string }[] = [];
    for (const b of RAW_BOXES) {
      if (!b.parent || !byId[b.parent]) continue;
      const p = px(byId[b.parent]);
      const c = px(b);
      const midY = c.top - 13;
      paths.push({ id: b.id, d: `M ${p.cx} ${p.bot} L ${p.cx} ${midY} L ${c.cx} ${midY} L ${c.cx} ${c.top}` });
    }
    return paths;
  }, [byId]);

  const counts = useMemo(() => {
    const roles = scenario.boxes.filter((b) => !b.context);
    const total = roles.length;
    const on = roles.filter((b) => isActive(b)).length;
    const by: Record<string, number> = { y2027: 0, y2028: 0, y2029: 0, existing: 0 };
    roles.forEach((b) => { if (isActive(b)) by[b.bucket]++; });
    return { total, on, by };
  }, [scenario, isActive]);

  return (
    <div className="doc">
      <header className="doc-hero org-hero">
        <div>
          <div className="kicker">SOM Structure · 2027–2029</div>
          <h1>Org Chart &amp; <em>Hiring Timelines</em></h1>
        </div>
        <p className="lede">
          The proposed School of Medicine org chart, revealed the way it will be built — hire by hire,
          quarter by quarter. Compare the <strong>Ideal</strong> ramp against the <strong>Failsafe</strong>{' '}
          schedule that absorbs approval and onboarding delays.
        </p>
      </header>

      <div className="org-controls">
        <div className="org-scenario-toggle">
          {Object.values(SCENARIOS).map((sc) => (
            <button
              key={sc.key}
              className={`ost-btn${scenarioKey === sc.key ? ' active' : ''}`}
              onClick={() => setScenarioKey(sc.key)}
            >
              {sc.name}
            </button>
          ))}
        </div>

        <div className="org-transport">
          <button className="org-play" onClick={() => {
            if (step >= ORG_STEPS.length - 1) { setStep(0); setPlaying(true); }
            else setPlaying((p) => !p);
          }}>
            {playing ? '❙❙ Pause' : (step >= ORG_STEPS.length - 1 ? '↻ Replay' : '▶ Play')}
          </button>
          <button className="org-step-btn" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0}>‹</button>
          <button className="org-step-btn" onClick={() => { setPlaying(false); setStep((s) => Math.min(ORG_STEPS.length - 1, s + 1)); }} disabled={step === ORG_STEPS.length - 1}>›</button>
        </div>

        <div className="org-step-readout">
          <span className="osr-label">Showing through</span>
          <span className="osr-value">{ORG_STEPS[step] === 'Baseline' ? 'Baseline (existing roles)' : ORG_STEPS[step]}</span>
        </div>
      </div>

      <div className="org-scrubber">
        {ORG_STEPS.map((s, i) => (
          <button
            key={s}
            className={`scrub-pill ${i === step ? 'current' : ''} ${i < step ? 'past' : ''}`}
            onClick={() => { setPlaying(false); setStep(i); }}
          >
            <span className="scrub-tick" />
            <span className="scrub-text">{s === 'Baseline' ? 'Start' : s}</span>
          </button>
        ))}
      </div>

      <div className="org-canvas-wrap" ref={wrapRef}>
        <div className="org-canvas" style={{ width: ORG_W, height: ORG_H, transform: `scale(${scale})` }}>
          <svg className="org-links" width={ORG_W} height={ORG_H} viewBox={`0 0 ${ORG_W} ${ORG_H}`}>
            {connectors.map((c) => {
              const box = scenario.boxes.find((b) => b.id === c.id);
              const active = box ? isActive(box) : false;
              return <path key={c.id} d={c.d} className={`org-link ${active ? 'on' : 'off'}`} />;
            })}
          </svg>

          {scenario.boxes.map((b) => {
            const g = px(b);
            const active = isActive(b);
            const fresh = justActivated(b) && step > 0 && !b.context && b.bucket !== 'existing';
            const fill = BUCKET[b.bucket].fill;
            const fontSize = b.h < 0.3 ? 8 : (b.w < 1.05 ? 9.5 : (b.w > 3 ? 13 : 10.5));
            return (
              <div
                key={b.id}
                className={`org-box${active ? ' on' : ' off'}${b.context ? ' context' : ''}${fresh ? ' fresh' : ''}`}
                style={{
                  left: g.l, top: g.t, width: g.w, height: g.h,
                  ['--bx' as string]: fill, fontSize,
                  background: active ? fill : undefined,
                }}
                title={b.context ? b.label : `${b.label} — ${b.q === 'Existing' ? 'existing role' : 'onboards ' + b.q}`}
              >
                <span className="org-box-label">{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="org-footer">
        <div className="org-legend">
          <div className="ol-title">Hire year</div>
          <div className="ol-items">
            {Object.entries(BUCKET).map(([key, val]) => (
              <span key={key} className="ol-item">
                <span className="ol-sw" style={{ background: val.fill }} />
                {val.label.replace(' role', '').replace(' hire', '')}
              </span>
            ))}
          </div>
        </div>

        <div className="org-counter">
          <div className="oc-big"><strong>{counts.on}</strong> <span>/ {counts.total} roles onboarded</span></div>
          <div className="oc-bar">
            {Object.entries(counts.by).map(([key, cnt]) => (
              <div key={key} className="oc-seg" style={{ width: `${cnt / counts.total * 100}%`, background: BUCKET[key]?.fill }} />
            ))}
          </div>
        </div>

        <div className="org-insights">
          <div className="oi-title">{scenario.name} — strategy</div>
          <ul>
            {scenario.insights.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
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
  { id: 'timeline',     label: 'Project Timeline',              num: '01', status: 'live', Component: TimelineTab },
  { id: 'orgchart',     label: 'Org Chart & Hiring Timelines',  num: '02', status: 'live', Component: OrgChartTab },
  {
    id: 'budget', label: 'Budget & Payments', num: '03', status: 'soon',
    blurb: 'The full financial picture — the quarterly payment schedule tied to deliverable acceptance, phase and sub-phase cost breakdowns, contingency tracking, and travel expenses across all 38 on-site trips.',
    planned: ['Quarterly payment schedule', 'Phase & sub-phase costs', 'Contingency tracking', 'Travel / trip expenses'],
  },
  {
    id: 'deliverables', label: 'Deliverables', num: '04', status: 'soon',
    blurb: 'A live checklist of every deliverable across the seven sub-phases, with owners, acceptance status, and links to the underlying documents as each milestone is submitted and approved.',
    planned: ['Acceptance status per item', 'Owner & due date', 'Regulatory submissions', 'Document links'],
  },
  {
    id: 'team', label: 'Team & Governance', num: '05', status: 'soon',
    blurb: 'Project leads, working teams, and the SOM governance structure — the PennMed and AUD participants, committee make-up, and reporting relationships as the school\'s leadership is recruited.',
    planned: ['Project leads & working teams', 'SOM org chart', 'Committees & roles', 'PennMed–AUD partner pairings'],
  },
  {
    id: 'documents', label: 'Documents', num: '06', status: 'soon',
    blurb: 'A central library for the MSA, SOW agreements, curriculum framework, accreditation submissions, and clinical-affiliate MOUs — versioned as they move from draft to final.',
    planned: ['MSA & SOWs', 'Curriculum framework', 'Accreditation filings', 'Affiliate MOUs'],
  },
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
              <span>Updated <strong>After Year 1 Q2 Report Accepted by AUD</strong></span>
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
