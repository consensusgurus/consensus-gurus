'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, ChevronDown } from 'lucide-react';
import { TYPES, COLORS } from '@/lib/data';
import { postList } from '@/lib/api';
import Grain from '../Grain';
import Footer from '../Footer';

function RequestView({ onBack, onSubmit }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('other');
  const [blurb, setBlurb] = useState('');
  const [criteria, setCriteria] = useState('');
  const [items, setItems] = useState(Array(10).fill(''));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateItem(idx, val) {
    const next = [...items];
    next[idx] = val;
    setItems(next);
  }

  function addSlot() {
    if (items.length >= 30) return;
    setItems([...items, '']);
  }

  function removeSlot(idx) {
    if (items.length <= 3) return;
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
  }

  function handleSubmit() {
    setError('');
    if (!title.trim()) return setError('Add a headline for your list');

    const cleanItems = items.map((i) => i.trim()).filter(Boolean).map((i) => i.slice(0, 90));

    const newList = {
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim().slice(0, 90),
      category: category.trim().slice(0, 40) || 'Reader Pick',
      type: type,
      // Always use 'search' as link type; admin can change on the backend.
      linkType: 'search',
      blurb: blurb.trim().slice(0, 220) || 'A reader-submitted list.',
      isUserSubmitted: true,
      submittedAt: Date.now(),
      submitterName: name.trim().slice(0, 80),
      submitterEmail: email.trim().slice(0, 120),
      defaultSource: 'ai',
      sources: {
        ai: {
          label: criteria.trim() ? `As Submitted: ${criteria.trim().slice(0, 100)}` : 'As Submitted',
          items: cleanItems,
        },
      },
      vote: {
        items: cleanItems,
      },
    };
    setSubmitting(true);
    onSubmit(newList);
  }

  const labelStyle = {
    fontFamily: 'DM Mono, monospace',
    fontSize: 10,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: COLORS.faded,
    marginBottom: 6,
    display: 'block',
  };

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1.5px solid ${COLORS.ink}`,
    padding: '8px 0',
    fontFamily: 'Fraunces, serif',
    fontSize: 18,
    color: COLORS.ink,
    outline: 'none',
    fontVariationSettings: '"SOFT" 100',
    boxSizing: 'border-box',
    textOverflow: 'ellipsis',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    fontSize: 16,
    minHeight: 60,
    fontFamily: 'DM Sans, sans-serif',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    paddingRight: 28,
    cursor: 'pointer',
  };

  const filledCount = items.filter((i) => i.trim()).length;

  return (
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto', padding: '24px 20px 80px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          fontFamily: 'DM Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: COLORS.ink,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 0',
        }}
      >
        <ArrowLeft size={14} strokeWidth={2.5} />
        Back to all lists
      </button>

      <div style={{ borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: 20, marginTop: 16, marginBottom: 32 }}>
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: COLORS.ember,
            marginBottom: 10,
          }}
        >
          Letter to the Editor
        </div>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 900,
            fontSize: 'clamp(42px, 10vw, 84px)',
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
            margin: 0,
            color: COLORS.ink,
            fontVariationSettings: '"SOFT" 100',
          }}
        >
          Request a
          <br />
          <span style={{ fontStyle: 'italic', color: COLORS.ember }}>list</span>
        </h1>
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 17,
            lineHeight: 1.45,
            margin: '16px 0 0',
            color: COLORS.faded,
            maxWidth: 560,
          }}
        >
          Only a headline is required. Add as much or as little as you want, and an editor will handle the rest.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <label style={labelStyle}>Headline (required)</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Best beaches in Sicily"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={90}
          />
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              border: `1.5px solid ${COLORS.ember}`,
              background: 'rgba(192, 57, 43, 0.08)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
              color: COLORS.ember,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <X size={14} strokeWidth={2.5} />
            {error}
          </div>
        )}

        <div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              background: COLORS.ink,
              color: COLORS.cream,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '16px 28px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: `3px 3px 0 ${COLORS.ember}`,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Sending...' : 'Request list'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 18 }}>
            <div>
              <label style={labelStyle}>Name (optional)</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>
            <div>
              <label style={labelStyle}>Email (optional)</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
              />
            </div>
          </div>

          <p
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: COLORS.faded,
              marginTop: 14,
            }}
          >
            Submitted lists are reviewed before going live
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label style={labelStyle}>Tag (optional)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Sicily, Travel, anything"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={40}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Type (optional)</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
              {TYPES.filter((t) => t.id !== 'all').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={2.5}
              style={{ position: 'absolute', right: 4, bottom: 12, pointerEvents: 'none', color: COLORS.ink }}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>One-line description (optional)</label>
          <textarea
            style={textareaStyle}
            placeholder="A quick pitch for your readers"
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            maxLength={220}
            rows={2}
          />
        </div>

        <div>
          <label style={labelStyle}>How you ranked them (optional)</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="By reputation, sand quality..."
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            maxLength={140}
          />
        </div>

        <div>
          <div
            style={{
              borderTop: `1px solid ${COLORS.ink}`,
              paddingTop: 20,
              marginTop: 8,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h3
              style={{
                fontFamily: 'Fraunces, serif',
                fontStyle: 'italic',
                fontSize: 22,
                margin: 0,
                color: COLORS.ink,
              }}
            >
              Your picks, in order (optional)
            </h3>
            <span
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: COLORS.faded,
              }}
            >
              {filledCount} filled · #1 at top
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((val, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: COLORS.paper,
                  border: `1.5px solid ${COLORS.ink}`,
                  padding: '10px 14px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Fraunces, serif',
                    fontWeight: 900,
                    fontSize: 22,
                    color: i === 0 ? COLORS.ember : COLORS.ink,
                    minWidth: 28,
                    fontFeatureSettings: '"lnum" 1',
                    fontVariationSettings: '"SOFT" 100',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateItem(i, e.target.value)}
                  placeholder={`Pick number ${i + 1} (optional)`}
                  maxLength={90}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'Fraunces, serif',
                    fontSize: 17,
                    color: COLORS.ink,
                    outline: 'none',
                    padding: '4px 0',
                    fontVariationSettings: '"SOFT" 100',
                  }}
                />
                {items.length > 3 && (
                  <button
                    onClick={() => removeSlot(i)}
                    aria-label="Remove slot"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: COLORS.faded,
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {items.length < 30 && (
            <button
              onClick={addSlot}
              style={{
                marginTop: 12,
                background: 'transparent',
                color: COLORS.ink,
                border: `1.5px dashed ${COLORS.ink}`,
                padding: '10px 16px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                justifyContent: 'center',
              }}
            >
              <Plus size={12} strokeWidth={3} />
              Add another slot
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestClient() {
  const router = useRouter();

  function backHome() {
    router.push('/');
  }

  async function handleSubmit(newList) {
    const result = await postList(newList);
    if (result && result.ok) {
      router.push(`/request/thanks`);
    } else {
      alert('Could not save your list. Please try again.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        color: COLORS.ink,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grain />
      <RequestView onBack={backHome} onSubmit={handleSubmit} />
      <Footer />
    </div>
  );
}
