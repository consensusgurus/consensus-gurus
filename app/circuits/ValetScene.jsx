'use client';

// ValetScene — the Valet Gauntlet's own picture: a valet at the stand and the
// red car, drawn once in SVG and moved by CSS.
//
// THREE MOMENTS, one component, keyed by `mode`:
//   arrive  the gate. The car rolls in from the left and stops at the stand,
//           the valet waves it in and holds a hand out for the keys.
//   depart  the handover between lots. The car pulls out to the RIGHT, which
//           is where every one of these boards exits, and the road scrolls
//           under it, then the next lot's name arrives.
//   park    the finish. The car sits parked, the valet tosses the keys in an
//           arc and catches them, and the headlights flash twice.
//   still   no motion at all: the pose only. Also what every mode collapses to
//           under prefers-reduced-motion.
//
// THE VALET IS AN ORIGINAL FIGURE, a flat silhouette rather than a drawing: a
// pale head with a solid dark band of sunglasses, a navy windbreaker with the
// job written across it in the run's accent the way a raid jacket carries its
// letters, dark trousers, a stance with the weight on one leg. The car is the
// red block from the boards themselves, so the thing you are sliding out of
// every lot is the thing being driven off between them.
//
// Every colour here is a literal or a --stg token with a literal fallback, so
// the scene reads the same on the run's near-black ground whatever the
// register, exactly as the run page itself does.

import React from 'react';
import { T } from '@/lib/theme';

const RED = T.danger;

export default function ValetScene({ mode = 'still', label = null, compact = false }) {
  return (
    <div className={`vs vs-${mode}${compact ? ' vs-compact' : ''}`} aria-hidden="true">
      <style>{CSS}</style>
      <svg viewBox="0 0 640 230" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A valet waits at the stand as the red car arrives">
        <defs>
          <linearGradient id="vsBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fde68a" stopOpacity=".55" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </linearGradient>
          <clipPath id="vsRoadClip"><rect x="0" y="176" width="640" height="54" /></clipPath>
        </defs>

        {/* THE ROAD: a kerb, the tarmac, and lane marks that scroll while a car
            is moving. The marks live in one group twice as wide as the stage
            and slide by exactly one repeat, so the loop has no seam. */}
        <rect x="0" y="176" width="640" height="54" fill="var(--stg-cell, #1a1d28)" />
        <rect x="0" y="174" width="640" height="3" fill="var(--stg-line2, #3a4256)" />
        <g clipPath="url(#vsRoadClip)">
          <g className="vs-marks">
            {Array.from({ length: 22 }).map((_, i) => (
              <rect key={i} x={i * 60} y="201" width="30" height="4" rx="2" fill="var(--stg-line, rgba(255,255,255,.18))" />
            ))}
          </g>
        </g>

        {/* THE STAND: a podium with the sign, and a key hook. */}
        <g className="vs-stand" transform="translate(452 0)">
          <rect x="0" y="104" width="46" height="72" rx="4" fill="var(--stg-raise, #0e131f)" stroke="var(--stg-line2, #3a4256)" strokeWidth="2" />
          <rect x="-6" y="96" width="58" height="14" rx="3" fill="var(--stg-acc, #bef264)" />
          <text x="23" y="106.5" textAnchor="middle" fontFamily="'Manrope', system-ui, sans-serif" fontWeight="900" fontSize="9.5" letterSpacing=".18em" fill="#08222e">VALET</text>
          <rect x="6" y="120" width="34" height="2" fill="var(--stg-line, rgba(255,255,255,.18))" />
          <rect x="6" y="128" width="34" height="2" fill="var(--stg-line, rgba(255,255,255,.18))" />
        </g>

        {/* THE VALET. Weight on the right leg, left hand at the hip, right arm
            free to wave, point and toss. Drawn with the origin at the feet. */}
        <g className="vs-valet" transform="translate(556 176)">
          {/* legs */}
          <path d="M-13 0 L-9 -58 L-1 -58 L-4 0 Z" fill="#141a2b" />
          <path d="M4 0 L1 -58 L9 -58 L14 0 Z" fill="#141a2b" />
          <rect x="-16" y="-4" width="14" height="5" rx="2" fill="#0b0f1a" />
          <rect x="3" y="-4" width="14" height="5" rx="2" fill="#0b0f1a" />
          {/* jacket */}
          <path d="M-20 -60 L-19 -112 Q0 -122 19 -112 L21 -60 Z" fill="#233a63" />
          <path d="M-19 -112 L-15 -102 L15 -102 L19 -112 Z" fill="#1a2b4d" />
          <rect x="-21" y="-64" width="42" height="5" fill="#1a2b4d" />
          <text x="0" y="-80" textAnchor="middle" fontFamily="'Manrope', system-ui, sans-serif" fontWeight="900" fontSize="10.5" letterSpacing=".14em" fill="var(--stg-acc, #bef264)">VALET</text>
          {/* left arm, hand on hip */}
          <path d="M-16 -108 L-28 -84 L-16 -74 L-12 -80 L-19 -86 L-10 -104 Z" fill="#233a63" />
          <circle cx="-15" cy="-73" r="4.2" fill="#e9edf4" />
          {/* right arm: pivots at the shoulder */}
          <g transform="translate(14 -108)">
            <g className="vs-arm">
              <path d="M0 0 L22 20 L20 27 L-4 6 Z" fill="#233a63" />
              <circle cx="22.5" cy="24.5" r="4.4" fill="#e9edf4" />
              {/* the keys, on the hand; they leave it only on the toss */}
              <g transform="translate(24 27)">
                <g className="vs-keys">
                  <circle cx="0" cy="0" r="4.6" fill="none" stroke="#fbbf24" strokeWidth="2.2" />
                  <rect x="3.6" y="-1.4" width="11" height="2.8" rx="1.4" fill="#fbbf24" />
                  <rect x="10.4" y="1" width="2.2" height="3.4" fill="#fbbf24" />
                  <rect x="7" y="1" width="2" height="2.6" fill="#fbbf24" />
                </g>
              </g>
            </g>
          </g>
          {/* head, hair, sunglasses */}
          <rect x="-5" y="-124" width="10" height="9" fill="#e9edf4" />
          <circle cx="0" cy="-134" r="15" fill="#e9edf4" />
          <path d="M-15 -136 Q-9 -152 6 -150 Q17 -148 15 -134 Q9 -142 -2 -143 Q-9 -142 -15 -136 Z" fill="#141a2b" />
          <rect x="-15" y="-136" width="13" height="8" rx="3" fill="#0b0f1a" />
          <rect x="2" y="-136" width="13" height="8" rx="3" fill="#0b0f1a" />
          <rect x="-3" y="-134.5" width="6" height="2" fill="#0b0f1a" />
          <rect x="-16" y="-136" width="32" height="1.8" rx="1" fill="#0b0f1a" />
          <rect x="-12" y="-134" width="5" height="1.4" fill="rgba(255,255,255,.42)" />
          <rect x="5" y="-134" width="5" height="1.4" fill="rgba(255,255,255,.42)" />
        </g>

        {/* THE CAR: the red block with wheels. Origin at its rear axle. */}
        <g className="vs-car">
          <g className="vs-carbody">
            <path className="vs-beam" d="M170 130 L330 108 L330 160 Z" fill="url(#vsBeam)" />
            <path d="M0 158 Q-4 158 -4 152 L-2 136 Q0 128 10 126 L40 124 L64 104 Q70 98 82 98 L120 98 Q132 98 138 106 L152 124 L164 128 Q172 130 172 138 L172 152 Q172 158 166 158 Z" fill={RED} stroke="#7a2318" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M46 125 L66 106 Q70 102 78 102 L96 102 L96 125 Z" fill="#0b0f1a" opacity=".85" />
            <path d="M102 102 L120 102 Q128 102 132 108 L146 125 L102 125 Z" fill="#0b0f1a" opacity=".85" />
            <rect x="160" y="132" width="10" height="7" rx="2" fill="#fde68a" />
            <rect x="-3" y="132" width="9" height="7" rx="2" fill="#fca5a5" />
            <rect x="60" y="136" width="52" height="3" rx="1.5" fill="#7a2318" opacity=".6" />
          </g>
          <g transform="translate(30 158)">
            <g className="vs-wheel">
              <circle r="16" fill="#0b0f1a" stroke="#3a4256" strokeWidth="3" />
              <circle r="7" fill="#e9edf4" />
              <rect x="-1.5" y="-13" width="3" height="26" fill="#0b0f1a" />
              <rect x="-13" y="-1.5" width="26" height="3" fill="#0b0f1a" />
            </g>
          </g>
          <g transform="translate(138 158)">
            <g className="vs-wheel">
              <circle r="16" fill="#0b0f1a" stroke="#3a4256" strokeWidth="3" />
              <circle r="7" fill="#e9edf4" />
              <rect x="-1.5" y="-13" width="3" height="26" fill="#0b0f1a" />
              <rect x="-13" y="-1.5" width="26" height="3" fill="#0b0f1a" />
            </g>
          </g>
          {/* speed lines, shown only while departing */}
          <g className="vs-speed">
            <rect x="-70" y="120" width="40" height="3" rx="1.5" fill="rgba(255,255,255,.35)" />
            <rect x="-58" y="134" width="30" height="3" rx="1.5" fill="rgba(255,255,255,.28)" />
            <rect x="-80" y="148" width="46" height="3" rx="1.5" fill="rgba(255,255,255,.22)" />
          </g>
        </g>

        {label ? (
          <text className="vs-label" x="320" y="42" textAnchor="middle" fontFamily="'DM Mono', ui-monospace, monospace" fontSize="12" letterSpacing=".18em" fill="var(--stg-mute, #8b95a8)">{label}</text>
        ) : null}
      </svg>
    </div>
  );
}

const CSS = `
.vs{position:relative;width:100%;max-width:560px;margin:0 auto;line-height:0;}
.vs svg{display:block;width:100%;height:auto;overflow:visible;}
.vs-compact{max-width:380px;}
.vs-car,.vs-wheel,.vs-arm,.vs-keys,.vs-marks,.vs-speed,.vs-beam{transform-box:fill-box;}
.vs-wheel{transform-origin:center;}
.vs-arm{transform-origin:0 0;}
.vs-keys{transform-origin:center;}
.vs-speed,.vs-beam{opacity:0;}

/* STILL: the car sits at the stand, the valet's hand is out for the keys. */
.vs .vs-car{transform:translate(268px, 0);}
.vs .vs-arm{transform:rotate(-40deg);}

/* ARRIVE: in from the left, easing to a stop; the wheels turn for as long as
   it moves, the road scrolls under it, the headlights are on until it stops,
   then the arm goes from a wave to a hand held out. */
.vs-arrive .vs-car{animation:vsIn 1.7s cubic-bezier(.2,.8,.2,1) both;}
.vs-arrive .vs-wheel{animation:vsSpin .5s linear 3 both;}
.vs-arrive .vs-marks{animation:vsRoad .6s linear 3 both;}
.vs-arrive .vs-beam{animation:vsBeam 1.9s ease-out both;}
.vs-arrive .vs-arm{animation:vsWave 2.4s ease-in-out both;}
.vs-arrive .vs-carbody{animation:vsSettle 1.7s ease-out both;}

/* DEPART: out to the right, accelerating. The keys stay with the valet, who
   sees it off with a salute, and the speed lines trail the car. */
.vs-depart .vs-car{animation:vsOut 1.5s cubic-bezier(.6,0,.9,.3) both;}
.vs-depart .vs-wheel{animation:vsSpin .35s linear 5 both;}
.vs-depart .vs-marks{animation:vsRoad .45s linear 4 both;}
.vs-depart .vs-speed{animation:vsSpeed 1.5s ease-in both;}
.vs-depart .vs-arm{animation:vsSalute 1.6s ease-in-out both;}
.vs-depart .vs-keys{opacity:0;}

/* PARK: the car is home. The keys go up in an arc and come back to the hand,
   and the headlights flash twice. */
.vs-park .vs-car{transform:translate(268px, 0);}
.vs-park .vs-arm{animation:vsToss 2.2s ease-in-out both;}
.vs-park .vs-keys{animation:vsKeys 2.2s ease-in-out both;}
.vs-park .vs-beam{animation:vsFlash 2.4s ease-in-out both;}

@keyframes vsIn{from{transform:translate(-260px,0);}to{transform:translate(268px,0);}}
@keyframes vsOut{from{transform:translate(268px,0);}to{transform:translate(720px,0);}}
@keyframes vsSpin{from{transform:rotate(0);}to{transform:rotate(360deg);}}
@keyframes vsRoad{from{transform:translateX(0);}to{transform:translateX(-60px);}}
@keyframes vsBeam{0%{opacity:1;}80%{opacity:1;}100%{opacity:0;}}
@keyframes vsFlash{0%,100%{opacity:0;}30%,45%{opacity:0;}35%,42%{opacity:1;}55%,62%{opacity:1;}}
@keyframes vsSpeed{0%{opacity:0;}30%{opacity:1;}100%{opacity:0;}}
@keyframes vsSettle{0%,84%{transform:translateY(0);}90%{transform:translateY(2px);}100%{transform:translateY(0);}}
@keyframes vsWave{0%{transform:rotate(-150deg);}20%{transform:rotate(-120deg);}40%{transform:rotate(-155deg);}60%{transform:rotate(-120deg);}80%{transform:rotate(-40deg);}100%{transform:rotate(-40deg);}}
@keyframes vsSalute{0%{transform:rotate(-40deg);}35%{transform:rotate(-170deg);}70%{transform:rotate(-170deg);}100%{transform:rotate(-40deg);}}
@keyframes vsToss{0%{transform:rotate(-40deg);}25%{transform:rotate(-120deg);}45%{transform:rotate(-95deg);}100%{transform:rotate(-40deg);}}
@keyframes vsKeys{0%{transform:translate(0,0) rotate(0);opacity:1;}25%{transform:translate(0,0) rotate(0);}45%{transform:translate(-6px,-46px) rotate(220deg);}62%{transform:translate(4px,-8px) rotate(360deg);}70%{transform:translate(0,0) rotate(360deg);}100%{transform:translate(0,0) rotate(360deg);}}

@media(prefers-reduced-motion:reduce){
  .vs *{animation:none !important;}
  .vs .vs-car{transform:translate(268px, 0) !important;}
  .vs .vs-arm{transform:rotate(-40deg) !important;}
  .vs-depart .vs-keys{opacity:1;}
}
`;
