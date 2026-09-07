import { STAGES, STAGE_LABELS, canEnterStage } from '../lib/design.js';

export function TopBar({ design, onGoTo, right }) {
  const idx = STAGES.indexOf(design.stage);
  return (
    <header className="topbar">
      <div className="topbar-row">
        <div className="brand">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#2f5a3d" />
            <path d="M8 22c0-8 6-13 16-13-1 9-7 14-14 14z" fill="#9BD26A" />
            <path d="M10 21l11-9" stroke="#1F3A2A" strokeWidth="1.6" fill="none" />
          </svg>
          Planting Bed Designer
        </div>
        <div className="topbar-actions">{right}</div>
      </div>
      <nav aria-label="Design stages">
        <ol className="stagerail">
          {STAGES.map((s, i) => {
            const allowed = canEnterStage(design, s);
            const cls = i < idx ? 'done' : i === idx ? 'current' : '';
            return (
              <li key={s} className={cls}>
                <button
                  type="button"
                  onClick={() => onGoTo(s)}
                  disabled={!allowed}
                  aria-current={i === idx ? 'step' : undefined}
                  aria-label={`${STAGE_LABELS[s]}${i < idx ? ', completed' : i === idx ? ', current stage' : allowed ? '' : ', not yet available'}`}
                >
                  {STAGE_LABELS[s]}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}

export function Notice({ kind = 'info', title, children, role }) {
  return (
    <div className={`notice notice-${kind}`} role={role || (kind === 'err' ? 'alert' : 'status')}>
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}

export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
  const cls = status === 'Complete' || status === 'Reviewed' || status === 'Ready for Review' ? 'ok' : status === 'Photo Needed' || status === 'In Progress' ? 'warn' : '';
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
