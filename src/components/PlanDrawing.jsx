import { useMemo, useRef, useState } from 'react';
import { localFrame, sceneBeds, scenePlants, seeded, foliageColor, inBloom, sizeAt, FT } from '../lib/scene.js';
import { CATEGORIES, MONTHS } from '../data/plants.js';
import { fmtSqFt, summarize } from '../lib/geometry.js';

// A landscape-plan drawing at true scale: beds as mulched shapes, plants as
// stylized canopy symbols sized to mature spread, a keyed plant list, scale
// bar, north arrow. Rendered as SVG so it prints sharp and can be saved.

const PX_PER_M = 40; // drawing resolution; 1 m = 40 px → 1 ft ≈ 12 px

function crownPath(cx, cy, r, seed, lobes = 7) {
  // Lobed outline for a broadleaf canopy.
  const n = lobes * 6;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + 0.1 * Math.sin(a * lobes + seeded(seed, 1) * 6) + 0.04 * (seeded(seed, i) - 0.5);
    pts.push([cx + Math.cos(a) * r * wobble, cy + Math.sin(a) * r * wobble]);
  }
  return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z`;
}
function coniferPath(cx, cy, r, seed) {
  // Star-like outline for a conifer seen from above.
  const n = 16;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seeded(seed, 2);
    const rr = i % 2 ? r : r * 0.72;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z`;
}
function grassPath(cx, cy, r, seed) {
  const n = 24;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seeded(seed, 3);
    const rr = i % 2 ? r : r * 0.55;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')}Z`;
}
function driftPath(cx, cy, r, seed) {
  const n = 10;
  const stretch = 1 + 0.35 * seeded(seed, 99);
  const rot = seeded(seed, 98) * Math.PI;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const jitter = 0.72 + 0.56 * seeded(seed, i);
    const x = Math.cos(a) * r * jitter * stretch;
    const y = Math.sin(a) * r * jitter;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  // smooth with quadratic curves
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  return d + 'Z';
}

export function buildPlan(design, { years = null, month = 6 } = {}) {
  const frame = localFrame(design, 3);
  if (!frame) return null;
  const beds = sceneBeds(design, frame);
  const plants = scenePlants(design, frame);
  const { bbox } = frame;
  const W = Math.ceil(bbox.w * PX_PER_M);
  const H = Math.ceil(bbox.h * PX_PER_M);
  const X = (x) => (x - bbox.minX) * PX_PER_M;
  const Y = (y) => (bbox.maxY - y) * PX_PER_M; // north up
  // Key: one letter/number per distinct plant.
  const key = [];
  const keyFor = (info) => {
    let k = key.find((e) => e.info.id === info.id);
    if (!k) {
      k = { info, code: String(key.length + 1), n: 0 };
      key.push(k);
    }
    k.n += 1;
    return k.code;
  };
  const symbols = plants
    .slice()
    .sort((a, b) => (b.info.spreadFt || 0) - (a.info.spreadFt || 0)) // big canopies first, small on top
    .map((p) => {
      const { spread } = sizeAt(p.info, p, years);
      const r = p.form === 'flower' ? 0.75 * FT * PX_PER_M : (spread / 2) * PX_PER_M;
      const cx = X(p.x), cy = Y(p.y);
      const color = inBloom(p.info, month) && p.info.bloomColor && p.form !== 'tree' && p.form !== 'conifer' ? p.info.bloomColor : foliageColor(p.info, p.id);
      const code = p.info.category === 'existing' ? null : keyFor(p.info);
      let d;
      if (p.form === 'conifer') d = coniferPath(cx, cy, r, p.id);
      else if (p.form === 'grass') d = grassPath(cx, cy, r, p.id);
      else if (p.form === 'flower') d = driftPath(cx, cy, r, p.id);
      else if (p.form === 'hardscape') d = null;
      else d = crownPath(cx, cy, r, p.id, p.form === 'tree' ? 7 : 5);
      return { ...p, cx, cy, r, d, color, code, bloom: inBloom(p.info, month) && p.info.bloomColor };
    });
  return { frame, beds, plants: symbols, key, W, H, X, Y, pxPerM: PX_PER_M };
}

export default function PlanDrawing({ design, years = null, month = 6, showKey = true, showLabels = true, id = 'plan-svg' }) {
  const plan = useMemo(() => buildPlan(design, { years, month }), [design, years, month]);
  if (!plan) return <p className="hint">Draw at least one bed to see a plan.</p>;
  const { beds, plants, key, W, H, X, Y, pxPerM } = plan;
  const KEY_W = showKey && key.length ? 260 : 0;
  const PAD = 24;
  const totalW = W + KEY_W + PAD * 2;
  const totalH = Math.max(H, showKey ? 40 + key.length * 26 + 60 : 0) + PAD * 2 + 50;
  const scaleFt = W / pxPerM > 15 ? 10 : 5; // scale bar length in feet
  const scalePx = scaleFt * FT * pxPerM;

  return (
    <svg id={id} className="plan-svg" viewBox={`0 0 ${totalW} ${totalH}`} width="100%" role="img" aria-label="Planting plan drawing" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mulch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="6" height="6" fill="#c9a77c" />
          <circle cx="1.5" cy="1.5" r="0.9" fill="#a8845a" />
          <circle cx="4.5" cy="4" r="0.7" fill="#b8926a" />
        </pattern>
        <pattern id="lawn" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#e6efd9" />
          <path d="M1 7l1-3M4 7l1-3M7 7l0.5-2" stroke="#cfe0bb" strokeWidth="0.8" fill="none" />
        </pattern>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#d9d9d9" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#9a9a9a" strokeWidth="1" />
        </pattern>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1.5" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.28" />
        </filter>
        <radialGradient id="shade" cx="40%" cy="38%" r="65%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <rect width={totalW} height={totalH} fill="#fbfaf6" />
      <g transform={`translate(${PAD} ${PAD})`}>
        <rect width={W} height={H} fill="url(#lawn)" stroke="#8a9a7a" strokeWidth="1" />
        {/* Beds */}
        {beds.map((b) => {
          const d = `M${b.local.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('L')}Z`;
          const c = b.local.reduce((a, p) => ({ x: a.x + p.x / b.local.length, y: a.y + p.y / b.local.length }), { x: 0, y: 0 });
          return (
            <g key={b.id}>
              <path d={d} fill="url(#mulch)" stroke={b.color} strokeWidth="3" strokeLinejoin="round" />
              {showLabels && (
                <text x={X(c.x)} y={Y(c.y)} className="plan-bedlabel" textAnchor="middle" dominantBaseline="middle" fill={b.color} stroke="#fff" strokeWidth="3" paintOrder="stroke" fontSize="14" fontWeight="700">
                  {b.name} · {fmtSqFt(summarize(b.points).areaSqFt)}
                </text>
              )}
            </g>
          );
        })}
        {/* Existing hardscape first, then plants */}
        {plants
          .filter((p) => p.form === 'hardscape')
          .map((p) => (
            <g key={p.id}>
              <rect x={p.cx - p.r} y={p.cy - p.r} width={p.r * 2} height={p.r * 2} fill="url(#hatch)" stroke="#666" strokeWidth="1.2" strokeDasharray="4 3" />
            </g>
          ))}
        {plants
          .filter((p) => p.form !== 'hardscape')
          .map((p) => (
            <g key={p.id} opacity={p.info.category === 'existing' ? 0.55 : 1}>
              <path d={p.d} fill={p.color} stroke={p.info.category === 'existing' ? '#555' : 'rgba(0,0,0,0.45)'} strokeWidth={p.form === 'flower' ? 0.8 : 1.2} strokeDasharray={p.info.category === 'existing' ? '5 4' : undefined} filter={p.form === 'tree' || p.form === 'conifer' || p.form === 'shrub' ? 'url(#shadow)' : undefined} />
              {p.form !== 'flower' && <path d={p.d} fill="url(#shade)" />}
              {(p.form === 'tree' || p.form === 'conifer') && <circle cx={p.cx} cy={p.cy} r={Math.max(1.5, p.r * 0.06)} fill="#3b2a1a" />}
              {p.form === 'tree' &&
                [0, 1, 2, 3].map((i) => {
                  const a = seeded(p.id, 20 + i) * Math.PI * 2;
                  return <line key={i} x1={p.cx} y1={p.cy} x2={p.cx + Math.cos(a) * p.r * 0.85} y2={p.cy + Math.sin(a) * p.r * 0.85} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />;
                })}
              {showLabels && p.code && p.r > 7 && (
                <text x={p.cx} y={p.cy + (p.form === 'flower' ? 0 : p.r * 0.45)} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(9, Math.min(13, p.r * 0.35))} fontWeight="700" fill="#111" stroke="#fff" strokeWidth="2.5" paintOrder="stroke">
                  {p.code}
                </text>
              )}
            </g>
          ))}
        {/* Scale bar */}
        <g transform={`translate(8 ${H - 28})`}>
          <rect x="0" y="0" width={scalePx} height="6" fill="#111" />
          <rect x="0" y="0" width={scalePx / 2} height="6" fill="#fff" stroke="#111" strokeWidth="1" />
          <text x="0" y="18" fontSize="10" fill="#111">
            0
          </text>
          <text x={scalePx} y="18" fontSize="10" fill="#111" textAnchor="end">
            {scaleFt} ft
          </text>
        </g>
        {/* North arrow */}
        <g transform={`translate(${W - 26} 30)`}>
          <polygon points="0,-18 7,10 0,5 -7,10" fill="#111" />
          <text x="0" y="24" fontSize="11" fontWeight="700" textAnchor="middle" fill="#111">
            N
          </text>
        </g>
      </g>
      {/* Key */}
      {showKey && key.length > 0 && (
        <g transform={`translate(${W + PAD * 2} ${PAD})`} fontSize="11" fill="#111">
          <text fontSize="14" fontWeight="700" y="14">
            Plant key
          </text>
          {key.map((k, i) => (
            <g key={k.info.id} transform={`translate(0 ${34 + i * 26})`}>
              <circle cx="9" cy="0" r="8" fill={k.info.bloomColor && inBloom(k.info, month) && k.info.category !== 'tree' ? k.info.bloomColor : foliageColor(k.info, k.info.id)} stroke="rgba(0,0,0,0.45)" />
              <text x="9" y="0" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill="#111" stroke="#fff" strokeWidth="2" paintOrder="stroke">
                {k.code}
              </text>
              <text x="24" y="-2" fontWeight="600">
                {k.n} × {k.info.name}
              </text>
              <text x="24" y="10" fontSize="9.5" fontStyle="italic" fill="#555">
                {k.info.botanical.length > 38 ? k.info.botanical.slice(0, 37) + '…' : k.info.botanical} · {k.info.heightFt}×{k.info.spreadFt} ft
              </text>
            </g>
          ))}
        </g>
      )}
      {/* Title block */}
      <g transform={`translate(${PAD} ${totalH - 22})`} fontSize="10" fill="#333">
        <text>
          {design.location?.address || 'Planting plan'} · 1 ft = {(FT * pxPerM).toFixed(1)} units · {years ? `Year ${years}` : 'At maturity'} · {MONTHS[month - 1]}
          {design.zone?.zone ? ` · USDA zone ${design.zone.zone}` : ''} · Drawn {new Date().toLocaleDateString()}
        </text>
      </g>
    </svg>
  );
}

// Download the SVG (as .svg or rasterized .png).
export async function downloadPlan(svgId, format = 'png', name = 'planting-plan') {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const trigger = (href, ext) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = `${name}.${ext}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 500);
  };
  if (format === 'svg') return trigger(URL.createObjectURL(blob), 'svg');
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  });
  const vb = svg.viewBox.baseVal;
  const scale = 2;
  const c = document.createElement('canvas');
  c.width = vb.width * scale;
  c.height = vb.height * scale;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  trigger(c.toDataURL('image/png'), 'png');
}

export function PlanControls({ years, setYears, month, setMonth }) {
  return (
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
  );
}

export function PlanDrawingPanel({ design }) {
  const [years, setYears] = useState(null);
  const [month, setMonth] = useState(6);
  const wrap = useRef(null);
  return (
    <section className="plan-panel" aria-label="Plan drawing">
      <div className="plan-toolbar no-print">
        <PlanControls years={years} setYears={setYears} month={month} setMonth={setMonth} />
        <div className="btn-row" style={{ margin: 0 }}>
          <button type="button" className="btn btn-sm" onClick={() => downloadPlan('plan-svg', 'png')}>
            Download PNG
          </button>
          <button type="button" className="btn btn-sm" onClick={() => downloadPlan('plan-svg', 'svg')}>
            Download SVG
          </button>
        </div>
      </div>
      <div ref={wrap} className="plan-wrap">
        <PlanDrawing design={design} years={years} month={month} />
      </div>
      <p className="hint">Symbols are drawn at the listed mature spread (or the chosen age). Bloom color shows for plants in flower in the chosen month. Existing features are dashed.</p>
      {CATEGORIES.length ? null : null}
    </section>
  );
}
