import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function NotFound({ onNavigate }) {
  const numRef   = useRef();
  const textRef  = useRef();
  const btnRef   = useRef();

  useEffect(() => {
    gsap.fromTo(
      [numRef.current, textRef.current, btnRef.current],
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 }
    );
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#050505',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
      backgroundImage: `
        repeating-linear-gradient(13deg, rgba(240,240,240,0.018) 0px, rgba(240,240,240,0.018) 1px, transparent 1px, transparent 5px),
        repeating-linear-gradient(103deg, rgba(240,240,240,0.018) 0px, rgba(240,240,240,0.018) 1px, transparent 1px, transparent 5px)
      `,
    }}>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.55rem',
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: 'rgba(240,240,240,0.28)',
        marginBottom: '1.2rem',
      }}>
        Joel Tchouke · Portfolio
      </p>

      <h1 ref={numRef} style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(7rem, 22vw, 16rem)',
        fontWeight: 300,
        color: 'rgba(240,240,240,0.08)',
        lineHeight: 1,
        margin: '0 0 0.2rem',
        letterSpacing: '-0.02em',
        userSelect: 'none',
      }}>
        404
      </h1>

      <div ref={textRef} style={{ marginBottom: '2.8rem' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(1.6rem, 5vw, 2.8rem)',
          fontWeight: 300,
          color: 'rgba(240,240,240,0.88)',
          margin: '0 0 1rem',
          lineHeight: 1.1,
        }}>
          Nothing here.
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.88rem',
          lineHeight: 1.8,
          color: 'rgba(240,240,240,0.38)',
          fontWeight: 300,
          maxWidth: 360,
          margin: '0 auto',
        }}>
          This page doesn't exist. Head back and explore what's actually here.
        </p>
      </div>

      <button ref={btnRef} onClick={() => onNavigate('main')} style={{
        background: 'none',
        border: '1px solid rgba(240,240,240,0.22)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.62rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'rgba(240,240,240,0.65)',
        cursor: 'pointer',
        padding: '0.55rem 1.3rem',
        transition: 'border-color 0.22s, color 0.22s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(240,240,240,0.7)'; e.currentTarget.style.color = '#f0f0f0'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(240,240,240,0.22)'; e.currentTarget.style.color = 'rgba(240,240,240,0.65)'; }}
      >
        ← Back to Main
      </button>

    </div>
  );
}
