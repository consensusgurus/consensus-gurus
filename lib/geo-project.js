// Natural Earth 1 forward projection against the fitted constants baked into
// lib/admin-world-map.js (WORLD.k / tx / ty). This mirrors d3-geo's
// geoNaturalEarth1 raw formula exactly, so neither the server-side aggregator
// (lib/geo-locate.js) nor the admin map client needs a d3 runtime dependency.
// The generator (scripts/generate-admin-geo.js) asserts <0.01px agreement with
// d3 at generation time and bakes spot checks into TEST_VECTORS.
export function projectPoint(world, lon, lat) {
  const lam = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const p2 = phi * phi;
  const p4 = p2 * p2;
  const x = lam * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = phi * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [world.tx + world.k * x, world.ty - world.k * y];
}
