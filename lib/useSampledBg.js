'use client';
import { useState, useEffect } from 'react';

// Auto-match a contain-fit hero's letterbox pad to the image's own background.
// Product / heroFit:'contain' tiles render the photo uncropped, which leaves a
// gutter around it; a fixed cream gutter clashes with a white product shot or a
// tinted one (e.g. the light-blue bidet). This hook samples the image's border
// pixels and returns their median color so the pad matches the photo (white
// stays white, blue stays blue). The image is loaded through the same-origin
// /_next/image optimizer, so the canvas read is never cross-origin-tainted.
// Returns null until resolved (and for transparent-corner PNGs); callers fall
// back to white in the meantime.
export function useSampledBg(src, enabled = true) {
  const [bg, setBg] = useState(null);
  useEffect(() => {
    if (!enabled || !src || typeof window === 'undefined') {
      setBg(null);
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = 48;
        const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1;
        const h = Math.max(1, Math.round(ratio * 48)) || 48;
        const cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        // 4 corners + 4 edge midpoints, 1px in from the border.
        const xL = 1, xR = w - 2, xM = w >> 1;
        const yT = 1, yB = h - 2, yM = h >> 1;
        const pts = [
          [xL, yT], [xR, yT], [xL, yB], [xR, yB],
          [xM, yT], [xM, yB], [xL, yM], [xR, yM],
        ];
        const rs = [], gs = [], bs = [];
        for (const [x, y] of pts) {
          const d = ctx.getImageData(x, y, 1, 1).data;
          if (d[3] < 200) continue; // skip transparent corners
          rs.push(d[0]); gs.push(d[1]); bs.push(d[2]);
        }
        if (!rs.length) {
          setBg(null);
          return;
        }
        const med = (a) => {
          a.sort((p, q) => p - q);
          return a[a.length >> 1];
        };
        setBg(`rgb(${med(rs)}, ${med(gs)}, ${med(bs)})`);
      } catch (e) {
        setBg(null);
      }
    };
    img.onerror = () => {
      if (!cancelled) setBg(null);
    };
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=64&q=60`;
    return () => {
      cancelled = true;
    };
  }, [src, enabled]);
  return bg;
}
