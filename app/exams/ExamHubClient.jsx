'use client';

// Standardized-test hub — landing page for the six "Where Will You Get In?"
// practice quizzes. Hidden / unlinked; the per-exam back button returns here.

import React from 'react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import { EXAMS, EXAM_ORDER } from './examData';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  faded: '#6b7280',
};
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function ExamHubClient() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip', fontFamily: FONT }}>
      <Grain />
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');"}</style>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '22px 22px 80px' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none', color: COLORS.ember, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>
          <ArrowLeft size={13} strokeWidth={2.5} /> Source of Truths
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <GraduationCap size={30} strokeWidth={2} style={{ color: COLORS.ember, flex: 'none' }} />
          <h1 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(28px, 4.5vw, 44px)', lineHeight: 1.04, letterSpacing: '-0.025em', margin: 0 }}>
            Where Will You Get In?
          </h1>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 16, lineHeight: 1.55, margin: '12px 0 0', color: COLORS.faded, maxWidth: 620 }}>
          Pick a test. Answer ten hard, real-style questions. We’ll match your score to a shortlist of schools, from the admissions test that gets you there.
        </p>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {EXAM_ORDER.map((key) => {
            const e = EXAMS[key];
            return (
              <a
                key={key}
                href={`/${key}`}
                style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: COLORS.ink, background: '#fff', border: `1.5px solid ${COLORS.faded}33`, borderLeft: `5px solid ${COLORS.ember}`, borderRadius: 10, padding: '18px 20px' }}
              >
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>{e.label}</span>
                  <span style={{ display: 'block', fontSize: 13.5, color: COLORS.faded, marginTop: 3, fontWeight: 500 }}>{e.tagline}</span>
                  <span style={{ display: 'block', fontSize: 12, color: COLORS.faded, marginTop: 6, letterSpacing: '0.04em' }}>
                    10 questions · ranked {e.payoffNoun} payoff
                  </span>
                </span>
                <ArrowRight size={20} strokeWidth={2.5} style={{ color: COLORS.ember, flex: 'none' }} />
              </a>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: COLORS.faded, margin: '24px 0 0', lineHeight: 1.5 }}>
          Questions are original, written in each test’s style. School rankings draw on U.S. News & World Report (2025–26 / 2026). For fun only, not admissions advice.
        </p>
      </div>

      <Footer />
    </div>
  );
}
