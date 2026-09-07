import { useEffect, useRef, useState } from 'react';
import { Modal, Notice } from './Shared.jsx';
import { allPhotosDone, photosDone } from '../lib/design.js';
import { summarize, fmtSqFt } from '../lib/geometry.js';
import { processPhoto, PhotoError } from '../lib/photos.js';
import { savePhotoBlob, loadPhotoBlob, deletePhotoBlob } from '../lib/storage.js';
import { detectEnvironment } from '../lib/transfer.js';

export function usePhotoUrls(beds) {
  const [urls, setUrls] = useState({});
  useEffect(() => {
    let alive = true;
    const created = [];
    (async () => {
      const next = {};
      for (const b of beds) {
        if (b.photo && !b.photo.unavailable) {
          try {
            const blob = await loadPhotoBlob(b.id);
            if (blob) {
              const u = URL.createObjectURL(blob);
              created.push(u);
              next[b.id] = u;
            }
          } catch {
            /* preview unavailable */
          }
        }
      }
      if (alive) setUrls(next);
    })();
    return () => {
      alive = false;
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [beds.map((b) => `${b.id}:${b.photo?.savedAt || ''}`).join('|')]);
  return urls;
}

export default function PhotosStage({ design, dispatch, onOpenInSafari }) {
  const env = detectEnvironment();
  const urls = usePhotoUrls(design.beds);
  const done = photosDone(design);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState({});
  const [unavail, setUnavail] = useState(null); // { id, note }
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const onFile = async (bed, file) => {
    if (!file) return; // user cancelled the picker — normal, not an error
    setErrors((e) => ({ ...e, [bed.id]: null }));
    setBusy((b) => ({ ...b, [bed.id]: true }));
    try {
      const out = await processPhoto(file);
      await savePhotoBlob(bed.id, out.blob);
      dispatch({
        type: 'updateBed',
        id: bed.id,
        patch: { photo: { name: file.name || 'photo', type: out.type, previewable: out.previewable, unavailable: false, note: '', savedAt: Date.now() } },
      });
    } catch (e) {
      const msg = e instanceof PhotoError ? e.message : 'The photo could not be saved on this device. Your bed design is unchanged. Try a different photo.';
      setErrors((er) => ({ ...er, [bed.id]: msg }));
    } finally {
      setBusy((b) => ({ ...b, [bed.id]: false }));
    }
  };

  const removePhoto = async (bed) => {
    try {
      await deletePhotoBlob(bed.id);
    } catch {
      /* ignore */
    }
    dispatch({ type: 'updateBed', id: bed.id, patch: { photo: null } });
  };

  return (
    <div className="page">
      <h1>Add a current photo of each bed</h1>
      <p>One photo per bed showing how it looks today. Photos stay on this device.</p>

      {env.embedded && !dismissedWarning && (
        <Notice kind="warn" title="Photo selection may not work inside this browser">
          This page appears to be open inside another app. On iPhone, the photo picker can close before you can choose a photo. Open the design in Safari before adding photos — your beds and measurements come with it.
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={onOpenInSafari}>
              Open in Safari
            </button>
            <button type="button" className="btn" onClick={() => setDismissedWarning(true)}>
              Try here anyway
            </button>
          </div>
        </Notice>
      )}

      <p aria-live="polite" style={{ fontWeight: 600, color: 'var(--ink)' }}>
        {done} of {design.beds.length} bed photos added
      </p>
      <div className="progressbar" role="progressbar" aria-valuemin={0} aria-valuemax={design.beds.length} aria-valuenow={done} aria-label="Bed photos added">
        <div style={{ width: `${(done / Math.max(1, design.beds.length)) * 100}%` }} />
      </div>

      {design.beds.map((b) => {
        const s = summarize(b.points);
        const url = urls[b.id];
        const p = b.photo;
        const status = !p ? 'Photo needed' : p.unavailable ? 'Photo unavailable' : 'Photo added';
        return (
          <section key={b.id} className="bedcard" style={{ '--c': b.color }} aria-label={`${b.name} photo`} data-testid={`photo-card-${b.number}`}>
            <h3>
              <span>
                <span className="chip" style={{ background: b.color }} />
                {b.name}
              </span>
              <span className={`status-pill ${p ? 'ok' : 'warn'}`}>{status}</span>
            </h3>
            <div className="nums">
              <span>
                Area <b>{fmtSqFt(s.areaSqFt)}</b>
              </span>
            </div>

            {p && !p.unavailable && (url ? <img className="photo-preview" src={url} alt={`Current condition of ${b.name}`} data-testid={`photo-preview-${b.number}`} /> : <div className="photo-missing">{p.previewable === false ? 'Photo saved. This browser cannot show a preview of this format (HEIC). It will still be listed in the report.' : 'Loading preview…'}</div>)}
            {p && p.unavailable && <div className="photo-missing">No photo — {p.note || 'no reason given'}</div>}
            {p && !p.unavailable && <p className="hint">{p.name}</p>}

            {errors[b.id] && (
              <Notice kind="err" title="That photo did not work">
                {errors[b.id]}
              </Notice>
            )}

            <div className="btn-row">
              {!p || p.unavailable ? (
                <>
                  <label className="btn btn-primary filebtn">
                    <input type="file" accept="image/*" data-testid={`file-${b.number}`} onChange={(e) => { onFile(b, e.target.files?.[0]); e.target.value = ''; }} disabled={busy[b.id]} />
                    {busy[b.id] ? 'Saving…' : 'Choose photo'}
                  </label>
                  <label className="btn filebtn">
                    <input type="file" accept="image/*" capture="environment" data-testid={`camera-${b.number}`} onChange={(e) => { onFile(b, e.target.files?.[0]); e.target.value = ''; }} disabled={busy[b.id]} />
                    Take photo
                  </label>
                  {!p && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUnavail({ id: b.id, note: '' })}>
                      Photo unavailable
                    </button>
                  )}
                </>
              ) : (
                <>
                  <label className="btn filebtn">
                    <input type="file" accept="image/*" data-testid={`replace-${b.number}`} onChange={(e) => { onFile(b, e.target.files?.[0]); e.target.value = ''; }} />
                    Replace photo
                  </label>
                  <button type="button" className="btn btn-danger" onClick={() => removePhoto(b)}>
                    Remove photo
                  </button>
                </>
              )}
              {p?.unavailable && (
                <button type="button" className="btn btn-sm" onClick={() => removePhoto(b)}>
                  Clear
                </button>
              )}
            </div>
          </section>
        );
      })}

      <button
        type="button"
        className="btn btn-primary btn-block"
        data-testid="photos-continue"
        onClick={() => {
          dispatch({ type: 'setPhotosDone', value: true });
          dispatch({ type: 'setStage', stage: 'plants' });
        }}
      >
        {allPhotosDone(design) ? 'Continue to planting design' : done > 0 ? 'Continue with the photos I have' : 'Skip photos and design the beds'}
      </button>
      <p className="hint">Photos are optional. You can come back and add them any time from the report.</p>

      {unavail && (
        <Modal title="Photo unavailable" onClose={() => setUnavail(null)}>
          <div className="field">
            <label htmlFor="note">Why is there no photo? (optional)</label>
            <textarea id="note" className="input" value={unavail.note} maxLength={200} onChange={(e) => setUnavail({ ...unavail, note: e.target.value })} placeholder="Bed is under snow; will photograph in spring." />
          </div>
          <div className="btn-row">
            <button type="button" className="btn" onClick={() => setUnavail(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                dispatch({ type: 'updateBed', id: unavail.id, patch: { photo: { unavailable: true, note: unavail.note.trim(), savedAt: Date.now() } } });
                setUnavail(null);
              }}
            >
              Mark unavailable
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
