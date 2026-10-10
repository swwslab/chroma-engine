/**
 * CHROMA ENGINE — experimental, printer-independent toolpath geometry.
 * Outputs neutral moves only. NOT machine-ready G-code.
 */
export function validate(p) {
  for (const k of ["height", "radius", "layerHeight", "lineWidth", "filamentDiameter", "segments"]) {
    if (!Number.isFinite(p[k]) || p[k] <= 0) throw new Error("Invalid positive parameter: " + k);
  }
  if (p.layerHeight > 0.64) throw new Error("Layer height exceeds experimental 0.8mm nozzle limit");
  if (p.lineWidth < 0.8 || p.lineWidth > 1.2) throw new Error("Line width outside initial calibration window");
  if (!Number.isInteger(p.segments) || p.segments < 32 || p.segments > 8192) throw new Error("Invalid segments");
  if (p.height > 200 || p.radius > 100) throw new Error("Outside initial prototype bounds");
  return p;
}
export function profileRadius(z, p) {
  const t = z / p.height;
  return p.radius * (1 + (p.flare ?? 0) / 100 * t + (p.waist ?? 0) / 100 * Math.sin(Math.PI * t));
}
export function motif(u, v, p) {
  const reps = p.repeats ?? 8, a = u * reps, b = v * reps * 1.2;
  const frac = x => x - Math.floor(x);
  switch (p.pattern) {
    case "diamonds": return Math.abs(frac(a) - .5) + Math.abs(frac(b) - .5) < .33;
    case "waves": return Math.abs(Math.sin(2 * Math.PI * (a + Math.sin(b * 2 * Math.PI) * .18))) > .62;
    case "stripes": return Math.sin(2 * Math.PI * b) > .1;
    case "checker": return (Math.floor(a) + Math.floor(b)) % 2 === 0;
    default: throw new Error("Unknown pattern");
  }
}
export function generate(p) {
  validate(p);
  const layers = Math.ceil(p.height / p.layerHeight);
  const areaFilament = Math.PI * (p.filamentDiameter / 2) ** 2;
  const results = [];
  let totalExtrusionMm = 0;
  for (let layer = 0; layer < layers; layer++) {
    const z = Math.min((layer + 1) * p.layerHeight, p.height);
    const h = layer === layers - 1 ? p.height - layer * p.layerHeight : p.layerHeight;
    const v = z / p.height;
    const points = [];
    for (let i = 0; i <= p.segments; i++) {
      const u = i / p.segments;
      const angle = 2 * Math.PI * u;
      const marked = motif(u, v, p);
      const r = profileRadius(z, p) + (marked ? (p.relief ?? 0) : 0);
      points.push({x:r*Math.cos(angle), y:r*Math.sin(angle), z, color:marked ? "B" : "A", e:0});
    }
    // Neutral E estimate: bead cross-section approximated as width * layer height.
    // Color transitions, retractions, purge, travel and actual deposited cross-section NOT modeled.
    for (let i = 1; i < points.length; i++) {
      const a = points[i-1], b = points[i];
      const distance = Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
      const extrusion = distance * p.lineWidth * h / areaFilament;
      b.e = extrusion;
      totalExtrusionMm += extrusion;
    }
    results.push({layer,z,points});
  }
  return {schema:"chroma-toolpaths-v0.2", machineReady:false, parameters:p, layers:results, totalExtrusionMm,
    warnings:["No base/bottom geometry","No machine start/end commands","No AMS tool changes or purge","No collision or flow validation","Not printable"]};
}
export function asCsv(result) {
  return ["layer,z_mm,x_mm,y_mm,color,estimated_delta_e_mm",...result.layers.flatMap(l=>l.points.map(pt=>[l.layer,pt.z.toFixed(3),pt.x.toFixed(3),pt.y.toFixed(3),pt.color,pt.e.toFixed(5)].join(",")))].join("\n");
}
