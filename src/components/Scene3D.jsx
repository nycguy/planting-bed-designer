import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { localFrame, sceneBeds, scenePlants, seeded, foliageColor, inBloom, sizeAt, FT } from '../lib/scene.js';
import { imageryById } from '../lib/mapServices.js';
import { MONTHS } from '../data/plants.js';

// 3D massing view of the design. Positions, spreads, and heights are exact
// to the design data; plant shapes are stylized (crown on trunk, mound,
// tuft, low mat). Ground is textured with the same aerial imagery as the
// map when the imagery server allows cross-origin use, otherwise plain.

const GROUND_ZOOM = 20;

function tileXY(lat, lng, z) {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const latR = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n;
  return { x, y };
}

// Compose aerial tiles covering the frame bbox into one canvas texture.
async function groundTexture(design, frame) {
  const { bbox, fromLocal } = frame;
  const src = imageryById(design.location.imagery);
  const nw = fromLocal({ x: bbox.minX, y: bbox.maxY });
  const se = fromLocal({ x: bbox.maxX, y: bbox.minY });
  const a = tileXY(nw[0], nw[1], GROUND_ZOOM);
  const b = tileXY(se[0], se[1], GROUND_ZOOM);
  const x0 = Math.floor(a.x), x1 = Math.floor(b.x), y0 = Math.floor(a.y), y1 = Math.floor(b.y);
  const cols = x1 - x0 + 1, rows = y1 - y0 + 1;
  if (cols * rows > 64) return null; // too large an area for a texture
  const T = 256;
  const canvas = document.createElement('canvas');
  canvas.width = cols * T;
  canvas.height = rows * T;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#7f9a6a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const urlFor = (x, y) => {
    if (src.type === 'xyz') return src.url.replace('{z}', GROUND_ZOOM).replace('{x}', x).replace('{y}', y);
    // Dynamic ArcGIS export: bbox in 3857.
    const R = 6378137;
    const n = 2 ** GROUND_ZOOM;
    const lon = (x / n) * 360 - 180;
    const lon2 = ((x + 1) / n) * 360 - 180;
    const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI;
    const lat2 = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n))) * 180) / Math.PI;
    const mx = (l) => (l * Math.PI * R) / 180;
    const my = (l) => Math.log(Math.tan(Math.PI / 4 + (l * Math.PI) / 360)) * R;
    const q = new URLSearchParams({ f: 'image', format: 'jpg', bboxSR: '3857', imageSR: '3857', size: `${T},${T}`, bbox: `${mx(lon)},${my(lat2)},${mx(lon2)},${my(lat)}`, ...(src.params || {}) });
    return `${src.url}/${src.type === 'arcgis-image' ? 'exportImage' : 'export'}?${q}`;
  };
  const load = (url) =>
    new Promise((res) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.referrerPolicy = 'no-referrer';
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = url;
    });
  let ok = 0;
  await Promise.all(
    Array.from({ length: cols * rows }, (_, i) => {
      const cx = x0 + (i % cols), cy = y0 + Math.floor(i / cols);
      return load(urlFor(cx, cy)).then((im) => {
        if (im) {
          ctx.drawImage(im, (cx - x0) * T, (cy - y0) * T, T, T);
          ok += 1;
        }
      });
    }),
  );
  if (!ok) return null;
  // Map the canvas onto the ground plane: compute UV offsets so the frame
  // bbox aligns with the tile mosaic.
  const u0 = (a.x - x0) / cols, u1 = (b.x - x0) / cols;
  const v0 = (a.y - y0) / rows, v1 = (b.y - y0) / rows;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.offset.set(u0, 1 - v1);
  tex.repeat.set(u1 - u0, v1 - v0);
  tex.anisotropy = 4;
  return tex;
}

function makePlant(p, years, month) {
  const { spread, height } = sizeAt(p.info, p, years);
  const g = new THREE.Group();
  const bloom = inBloom(p.info, month) && p.info.bloomColor;
  const leaf = new THREE.Color(foliageColor(p.info, p.id));
  const existing = p.info.category === 'existing';
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, transparent: existing, opacity: existing ? 0.45 : 1, ...extra });
  const r = spread / 2;
  if (p.form === 'hardscape') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(spread, 0.25, spread), mat('#9a9a9a'));
    m.position.y = 0.125;
    g.add(m);
    return g;
  }
  if (p.form === 'tree' || p.form === 'conifer') {
    const trunkH = Math.max(0.6, height * (p.form === 'conifer' ? 0.12 : 0.35));
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.04, spread * 0.02), Math.max(0.05, spread * 0.03), trunkH, 8), mat('#5b4634'));
    trunk.position.y = trunkH / 2;
    g.add(trunk);
    let crown;
    if (p.form === 'conifer') {
      crown = new THREE.Mesh(new THREE.ConeGeometry(r, height - trunkH, 12), mat(leaf));
      crown.position.y = trunkH + (height - trunkH) / 2;
    } else {
      const crownH = height - trunkH;
      crown = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat(bloom ? new THREE.Color(bloom).lerp(leaf, 0.35) : leaf));
      crown.scale.set(r, crownH / 2, r * (0.9 + seeded(p.id, 4) * 0.2));
      crown.position.y = trunkH + crownH / 2;
    }
    crown.castShadow = true;
    g.add(crown);
    return g;
  }
  if (p.form === 'shrub' || p.form === 'groundcover') {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9, 0, Math.PI * 2, 0, Math.PI / 2), mat(bloom ? new THREE.Color(bloom).lerp(leaf, 0.5) : leaf));
    m.scale.set(r, height, r * (0.9 + seeded(p.id, 5) * 0.2));
    m.castShadow = true;
    g.add(m);
    if (bloom) {
      // a few flower dots on top
      for (let i = 0; i < 12; i++) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.03, r * 0.09), 6, 5), mat(bloom));
        const a = seeded(p.id, 30 + i) * Math.PI * 2, rr = seeded(p.id, 60 + i) * r * 0.8;
        d.position.set(Math.cos(a) * rr, height * Math.sqrt(1 - (rr / r) ** 2) * 0.98, Math.sin(a) * rr);
        g.add(d);
      }
    }
    return g;
  }
  if (p.form === 'grass') {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, height, 10, 1, true), mat(leaf, { side: THREE.DoubleSide }));
    m.rotation.x = Math.PI;
    m.position.y = height / 2;
    g.add(m);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.6, height * 0.6, 8), mat(leaf));
    base.position.y = height * 0.3;
    g.add(base);
    return g;
  }
  // flower drift: low irregular mat
  const matR = 0.75 * FT;
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(matR, matR * 0.9, Math.max(0.15, height * 0.8), 10), mat(bloom || leaf));
  disk.scale.set(1 + 0.35 * seeded(p.id, 99), 1, 1);
  disk.rotation.y = seeded(p.id, 98) * Math.PI;
  disk.position.y = Math.max(0.15, height * 0.8) / 2;
  g.add(disk);
  return g;
}

export default function Scene3D({ design, years, month, onStatus }) {
  const host = useRef(null);
  const state = useRef({});

  // Build the static scene once.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const frame = localFrame(design, 8);
    if (!frame) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    } catch {
      onStatus?.('3D is not available in this browser.');
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#dfe9f3');
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 500);
    const { bbox } = frame;
    const cx = (bbox.minX + bbox.maxX) / 2, cz = -(bbox.minY + bbox.maxY) / 2;
    const span = Math.max(bbox.w, bbox.h);
    camera.position.set(cx + span * 0.45, span * 0.5, cz + span * 0.75);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(cx, 0.5, cz);
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2;
    controls.maxDistance = span * 4;
    controls.enableDamping = true;

    scene.add(new THREE.HemisphereLight('#ffffff', '#6b7d5a', 0.9));
    const sun = new THREE.DirectionalLight('#fff4d6', 1.2);
    sun.position.set(cx - span, span * 0.9, cz - span * 0.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = span * 4;
    scene.add(sun);

    // Ground (local x east, local y north → three -z).
    const groundGeo = new THREE.PlaneGeometry(bbox.w, bbox.h);
    const groundMat = new THREE.MeshStandardMaterial({ color: '#8fa877', roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(cx, 0, cz);
    ground.receiveShadow = true;
    scene.add(ground);
    onStatus?.('Loading aerial imagery…');
    groundTexture(design, frame)
      .then((tex) => {
        if (tex) {
          groundMat.map = tex;
          groundMat.color.set('#ffffff');
          groundMat.needsUpdate = true;
          onStatus?.('');
        } else onStatus?.('Aerial imagery could not be used as a 3D ground texture; showing plain ground.');
      })
      .catch(() => onStatus?.(''));

    // Beds: thin extruded mulch shapes.
    for (const b of sceneBeds(design, frame)) {
      const shape = new THREE.Shape(b.local.map((p) => new THREE.Vector2(p.x, -p.y)));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 1 }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.005;
      mesh.receiveShadow = true;
      scene.add(mesh);
      // outline in the bed color
      const pts = b.local.map((p) => new THREE.Vector3(p.x, 0.1, -p.y));
      pts.push(pts[0].clone());
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: b.color })));
    }

    const plantGroup = new THREE.Group();
    scene.add(plantGroup);

    let raf;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();
    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    state.current = { renderer, scene, camera, controls, plantGroup, frame, cx, cz, span };
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      el.innerHTML = '';
      state.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.id, design.beds, design.location?.imagery]);

  // Rebuild plants when the data, age, or month changes.
  useEffect(() => {
    const { plantGroup, frame } = state.current;
    if (!plantGroup || !frame) return;
    while (plantGroup.children.length) {
      const c = plantGroup.children.pop();
      c.traverse((o) => {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
      });
    }
    for (const p of scenePlants(design, frame)) {
      const g = makePlant(p, years, month);
      g.position.set(p.x, 0.08, -p.y);
      plantGroup.add(g);
    }
  }, [design.plants, years, month, design.beds]);

  // Expose camera presets and snapshot through the host element.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    el.__view = (preset) => {
      const { camera, controls, cx, cz, span } = state.current;
      if (!camera) return;
      if (preset === 'top') camera.position.set(cx, span * 1.4, cz + 0.01);
      else if (preset === 'street') camera.position.set(cx, 1.7, cz + span * 0.9);
      else camera.position.set(cx + span * 0.45, span * 0.5, cz + span * 0.75);
      controls.target.set(cx, 0.5, cz);
      controls.update();
    };
    el.__snapshot = () => state.current.renderer?.domElement.toDataURL('image/png');
  });

  return <div ref={host} className="scene3d" role="img" aria-label="3D view of the planting design" />;
}

export function Scene3DPanel({ design }) {
  const [years, setYears] = useState(null);
  const [month, setMonth] = useState(6);
  const [status, setStatus] = useState('');
  const ref = useRef(null);
  const view = (p) => ref.current?.querySelector('.scene3d')?.__view?.(p);
  const snap = () => {
    const url = ref.current?.querySelector('.scene3d')?.__snapshot?.();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `planting-3d-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 500);
  };
  return (
    <section className="scene-panel" aria-label="3D view" ref={ref}>
      <div className="plan-toolbar no-print">
        <div className="plan-controls">
          <label>
            Age
            <select className="input" value={years ?? ''} onChange={(e) => setYears(e.target.value === '' ? null : Number(e.target.value))}>
              <option value="1">Year 1</option>
              <option value="3">Year 3</option>
              <option value="5">Year 5</option>
              <option value="10">Year 10</option>
              <option value="">Mature</option>
            </select>
          </label>
          <label>
            Month
            <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="btn-row" style={{ margin: 0 }}>
          <button type="button" className="btn btn-sm" onClick={() => view('default')}>
            Overview
          </button>
          <button type="button" className="btn btn-sm" onClick={() => view('street')}>
            Eye level
          </button>
          <button type="button" className="btn btn-sm" onClick={() => view('top')}>
            Top
          </button>
          <button type="button" className="btn btn-sm" onClick={snap}>
            Save image
          </button>
        </div>
      </div>
      <Scene3D design={design} years={years} month={month} onStatus={setStatus} />
      <p className="hint">
        Drag to orbit, scroll or pinch to zoom, right-drag or two-finger drag to pan. Sizes are exact; plant shapes are stylized. {status}
      </p>
    </section>
  );
}
