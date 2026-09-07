import { useEffect, useState } from 'react';
import { plantPhoto } from '../lib/plantPhotos.js';

// A reference photo pulled from Wikipedia for a plant. Renders nothing at
// all if there is no photo, so lists stay tidy offline.
export default function PlantPhoto({ plant, size = 44, wide = false }) {
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

  if (wide) {
    if (!photo) return null;
    return (
      <figure className="plantfig">
        <img src={photo.src} alt={`${plant.name} (${plant.botanical})`} loading="lazy" />
        <figcaption>
          Photo via{' '}
          <a href={photo.page} target="_blank" rel="noreferrer">
            Wikipedia
          </a>
        </figcaption>
      </figure>
    );
  }
  return (
    <span className="plantthumb" style={{ width: size, height: size }} aria-hidden="true">
      {photo ? <img src={photo.src} alt="" loading="lazy" width={size} height={size} /> : null}
    </span>
  );
}
