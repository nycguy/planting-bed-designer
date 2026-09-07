import { useEffect, useMemo, useReducer, useState } from 'react';
import { TopBar, Modal, Notice } from './components/Shared.jsx';
import BedsStage from './components/BedsStage.jsx';
import LocationStage from './components/LocationStage.jsx';
import SketchStage from './components/SketchStage.jsx';
import ReviewStage from './components/ReviewStage.jsx';
import PhotosStage from './components/PhotosStage.jsx';
import CompleteStage from './components/CompleteStage.jsx';
import { newDesign, reducer, canEnterStage, maxReachableStage, STAGES, upgradeDesign, cryptoId } from './lib/design.js';
import PlantsStage from './components/PlantsStage.jsx';
import { loadDesign, saveDesign, clearDesign, clearAllPhotos, storageAvailable } from './lib/storage.js';
import { consumeTransferFromUrl, transferUrl, safariSchemeUrl, detectEnvironment } from './lib/transfer.js';

function initialState() {
  const transferred = upgradeDesign(consumeTransferFromUrl());
  const saved = upgradeDesign(loadDesign());
  if (transferred) {
    // Keep photo metadata for beds that already exist on this device
    // (photo bytes live in this browser's IndexedDB).
    if (saved) {
      const byId = Object.fromEntries(saved.beds.map((b) => [b.id, b]));
      transferred.beds = transferred.beds.map((b) => ({ ...b, photo: byId[b.id]?.photo || null }));
    }
    saveDesign(transferred);
    return { design: transferred, resume: null, transferred: true };
  }
  if (saved && saved.beds.length) return { design: saved, resume: saved };
  return { design: saved || newDesign(), resume: null };
}

export default function App() {
  const init = useMemo(initialState, []);
  const [design, dispatch] = useReducer(reducer, init.design);
  const [resume, setResume] = useState(init.resume);
  const [confirmNew, setConfirmNew] = useState(false);
  const [safari, setSafari] = useState(null); // { url, copied }
  const [editEntry, setEditEntry] = useState({ bedId: null, action: null, nonce: 0 });
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const hasStorage = useMemo(storageAvailable, []);
  const env = useMemo(detectEnvironment, []);

  // Persist on every change.
  useEffect(() => {
    saveDesign(design);
  }, [design]);

  // Test hook: lets end-to-end tests build a transfer link from the bundled code.
  useEffect(() => {
    window.__pbdTransferUrl = (d) => transferUrl(d);
  }, []);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Never render a stage the design has not earned (e.g. after edits un-review it).
  const stage = canEnterStage(design, design.stage) ? design.stage : maxReachableStage(design);
  useEffect(() => {
    if (stage !== design.stage) dispatch({ type: 'setStage', stage });
  }, [stage, design.stage]);

  const goTo = (s) => {
    if (!canEnterStage(design, s)) return;
    setEditEntry({ bedId: null, action: null, nonce: editEntry.nonce + 1 });
    dispatch({ type: 'setStage', stage: s });
  };
  const onEditBed = (bedId, action) => {
    setEditEntry({ bedId, action, nonce: editEntry.nonce + 1 });
    dispatch({ type: 'setStage', stage: 'sketch' });
  };
  const onAddBed = () => {
    const id = cryptoId();
    dispatch({ type: 'addBed', id });
    onEditBed(id, 'redraw');
  };
  const startNew = async () => {
    clearDesign();
    try {
      await clearAllPhotos();
    } catch {
      /* ignore */
    }
    dispatch({ type: 'replace', design: newDesign() });
    setConfirmNew(false);
    setResume(null);
  };
  const openInSafari = async () => {
    const url = transferUrl(design);
    setSafari({ url, copied: false });
    if (env.isIOS) {
      // Best effort: iOS honors this scheme from some in-app browsers. If it is
      // ignored, the modal offers copy and share fallbacks.
      setTimeout(() => {
        window.location.href = safariSchemeUrl(url);
      }, 150);
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(safari.url);
      setSafari({ ...safari, copied: true });
    } catch {
      setSafari({ ...safari, copied: false, copyFailed: true });
    }
  };
  const shareLink = async () => {
    try {
      await navigator.share({ title: 'Planting Bed Designer', url: safari.url });
    } catch {
      /* user cancelled */
    }
  };

  const showResume = !!resume && STAGES.indexOf(resume.stage) > 0;

  return (
    <div className="app">
      <TopBar
        design={{ ...design, stage }}
        onGoTo={goTo}
        right={
          <>
            {env.embedded && (
              <button type="button" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderColor: 'transparent' }} onClick={openInSafari}>
                Open in Safari
              </button>
            )}
            <button type="button" className="btn btn-sm btn-ghost" style={{ color: '#fff' }} onClick={() => setConfirmNew(true)} aria-label="Start a new design">
              New
            </button>
          </>
        }
      />
      <main className="main">
        {!hasStorage && (
          <Notice kind="err" title="Browser storage is unavailable">
            Your work cannot be saved between visits in this browser (private browsing may cause this). You can still design beds, but reloading the page will lose them.
          </Notice>
        )}
        {!online && (
          <Notice kind="warn" title="Internet connection lost">
            Your design is saved on this device. New map imagery and address search will not load until you reconnect.
          </Notice>
        )}
        {init.transferred && stage !== 'photos' && (
          <Notice kind="ok" title="Design transferred">
            Your beds, measurements, and map position came with you. Continue where you left off.
          </Notice>
        )}
        {stage === 'beds' && <BedsStage design={design} dispatch={dispatch} />}
        {stage === 'location' && <LocationStage design={design} dispatch={dispatch} />}
        {stage === 'sketch' && <SketchStage key={editEntry.nonce} design={design} dispatch={dispatch} initialBedId={editEntry.bedId} initialAction={editEntry.action} />}
        {stage === 'review' && <ReviewStage design={design} dispatch={dispatch} onEditBed={onEditBed} onAddBed={onAddBed} />}
        {stage === 'photos' && <PhotosStage design={design} dispatch={dispatch} onOpenInSafari={openInSafari} />}
        {stage === 'plants' && <PlantsStage design={design} dispatch={dispatch} />}
        {stage === 'complete' && <CompleteStage design={design} dispatch={dispatch} onEditBed={onEditBed} onAddBed={onAddBed} onStartNew={() => setConfirmNew(true)} />}
      </main>

      {showResume && (
        <Modal title="Continue your saved design?" onClose={() => setResume(null)}>
          <p>
            {resume.location?.address ? `${resume.location.address} — ` : ''}
            {resume.beds.length} bed{resume.beds.length === 1 ? '' : 's'}, last at the {resume.stage} stage.
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={() => setResume(null)} data-testid="continue-saved">
              Continue saved design
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setResume(null);
                setConfirmNew(true);
              }}
            >
              Start new design
            </button>
          </div>
        </Modal>
      )}

      {confirmNew && (
        <Modal title="Start a new design?" onClose={() => setConfirmNew(false)}>
          <p>This removes the current design, including every bed outline and photo saved on this device. This cannot be undone.</p>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setConfirmNew(false)}>
              Keep current design
            </button>
            <button type="button" className="btn btn-danger" onClick={startNew} data-testid="confirm-new">
              Delete and start new
            </button>
          </div>
        </Modal>
      )}

      {safari && (
        <Modal title="Continue in Safari" onClose={() => setSafari(null)}>
          <p>This link carries your whole design — address, map position, bed names, colors, and every outline. Photos are added once you are in Safari.</p>
          <ol style={{ paddingLeft: 20, color: 'var(--ink-soft)' }}>
            <li>Copy the link (or use Share, then “Copy”).</li>
            <li>Open Safari and paste it into the address bar.</li>
            <li>Continue to the Photos stage there.</li>
          </ol>
          {safari.copied && <Notice kind="ok">Link copied. Open Safari and paste it.</Notice>}
          {safari.copyFailed && (
            <Notice kind="warn">
              Copying was blocked here. Use Share instead, or select this link: <span style={{ wordBreak: 'break-all', fontSize: 12 }}>{safari.url}</span>
            </Notice>
          )}
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={copyLink}>
              Copy link
            </button>
            {typeof navigator !== 'undefined' && navigator.share && (
              <button type="button" className="btn" onClick={shareLink}>
                Share…
              </button>
            )}
            <button type="button" className="btn" onClick={() => setSafari(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
