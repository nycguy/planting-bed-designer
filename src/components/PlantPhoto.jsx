import { useEffect, useState } from 'react';
import { plantPhoto } from '../lib/plantPhotos.js';

function usePhoto(plant) {
  const [photo, setPhoto] = useState(undefined);
  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    setPhoto(undefined);
    plantPhoto(plant, { signal: ctrl.signal })
      .then((p) => alive && setPhoto(p))
      .catch(() => alive && setPhoto(null));
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [plant?.id]);
  return photo;
}

const hasHover = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;

// Wrap anything in this to get a large photo card on mouse hover (desktop
// only). Used by plant rows, the bloom calendar, and the report list.
export function PlantHover({ plant, children, className, style, as: Tag = 'span', ...rest }) {
  const photo = usePhoto(plant);
  const [pos, setPos] = useState(null);
  // Show the small thumbnail at once (it is already cached by the row), and
  // swap in the larger rendition only after it has finished loading.
  const [largeReady, setLargeReady] = useState(false);
  useEffect(() => {
    setLargeReady(false);
    if (!pos || !photo?.large || photo.large === photo.src) return;
    let alive = true;
    const im = new Image();
    im.onload = () => alive && setLargeReady(true);
    im.src = photo.large;
    return () => {
      alive = false;
    };
  }, [pos, photo?.large, photo?.src]);
  if (!plant || plant.category === 'existing') return <Tag className={className} style={style} {...rest}>{children}</Tag>;
  const shown = photo ? (largeReady ? photo.large : photo.src) : null;
  const onEnter = (e) => {
    if (!hasHover()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const w = 320;
    const x = r.right + 12 + w > window.innerWidth ? Math.max(8, r.left - w - 12) : r.right + 12;
    setPos({ x, y: Math.max(8, Math.min(r.top, window.innerHeight - 360)) });
  };
  return (
    <Tag className={className} style={style} onMouseEnter={onEnter} onMouseLeave={() => setPos(null)} {...rest}>
      {children}
      {pos && (
        <span className="plantpreview" style={{ left: pos.x, top: pos.y }} role="presentation">
          {shown ? (
            <img src={shown} alt="" referrerPolicy="no-referrer" className={largeReady ? '' : 'small'} />
          ) : (
            <span className="plantpreview-empty">{photo === undefined ? 'Loading photo…' : 'No photo available'}</span>
          )}
          <small>
            <b>{plant.name}</b> — <i>{plant.botanical}</i>
            {plant.heightFt ? ` · ${plant.heightFt} ft H × ${plant.spreadFt} ft W` : ''}
          </small>
        </span>
      )}
    </Tag>
  );
}

// Thumbnail (list rows) or large figure (detail dialog). Renders nothing
// visible if there is no photo, so lists stay tidy offline.
export default function PlantPhoto({ plant, size = 44, wide = false, hover = true }) {
  const photo = usePhoto(plant);
  if (wide) {
    if (!photo) return null;
    return (
      <figure className="plantfig">
        <img src={photo.large || photo.src} alt={`${plant.name} (${plant.botanical})`} loading="lazy" referrerPolicy="no-referrer" />
        <figcaption>
          Photo via{' '}
          <a href={photo.page} target="_blank" rel="noreferrer">
            Wikipedia
          </a>
        </figcaption>
      </figure>
    );
  }
  const img = photo ? <img src={photo.src} alt="" loading="lazy" width={size} height={size} referrerPolicy="no-referrer" /> : null;
  if (!hover) {
    return (
      <span className="plantthumb" style={{ width: size, height: size }} aria-hidden="true">
        {img}
      </span>
    );
  }
  return (
    <PlantHover plant={plant} className="plantthumb" style={{ width: size, height: size }} aria-hidden="true">
      {img}
    </PlantHover>
  );
}
