import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './../css/preloader.css';

function Preloader({ onComplete }) {
  const rootRef     = useRef();
  const countRef    = useRef();
  const ringRef     = useRef();
  const barRef      = useRef();
  const monoRef     = useRef();
  const svgRef      = useRef();
  const countRowRef = useRef();

  useEffect(() => {
    const root     = rootRef.current;
    const countEl  = countRef.current;
    const bar      = barRef.current;
    const ring     = ringRef.current;
    const mono     = monoRef.current;
    const svgEl    = svgRef.current;
    const countRow = countRowRef.current;

    const r = 54;
    const circumference = 2 * Math.PI * r;
    ring.style.strokeDasharray  = circumference;
    ring.style.strokeDashoffset = circumference;

    // Entrance — stagger ring, monogram, count into view
    gsap.set([svgEl, mono, countRow], { opacity: 0, y: 14 });
    gsap.to([svgEl, mono, countRow], {
      opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', delay: 0.15, stagger: 0.06,
    });

    const obj = { val: 0 };
    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(obj, {
      val: 100,
      duration: 2.4,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(obj.val);
        countEl.textContent = String(v).padStart(2, '0');
        bar.style.transform = `scaleX(${v / 100})`;
        ring.style.strokeDashoffset = circumference * (1 - v / 100);
      },
    })
    .to({}, { duration: 0.4 })

    // Fade ring + count, keep monogram visible
    .to([svgEl, countRow], { opacity: 0, y: -8, duration: 0.32, ease: 'power2.in' })

    // Fly TJ from centre to topBar logo position
    .add(() => {
      const logoEl = document.querySelector('.topBar__logo');
      if (!logoEl) return;

      const monoRect = mono.getBoundingClientRect();
      const logoRect = logoEl.getBoundingClientRect();

      // Hide topBar logo — the flying TJ will land there
      gsap.set(logoEl, { opacity: 0 });

      // Detach from preloader so the upcoming clip-path wipe can't clip it
      mono.style.inset  = 'auto';
      mono.style.margin = '0';
      gsap.set(mono, {
        position : 'fixed',
        top      : monoRect.top,
        left     : monoRect.left,
        width    : monoRect.width,
        height   : monoRect.height,
        zIndex   : 10001,
      });
      document.body.appendChild(mono);

      // Fly to logo
      gsap.to(mono, {
        top      : logoRect.top,
        left     : logoRect.left,
        width    : logoRect.width,
        height   : logoRect.height,
        fontSize : '1.05rem',
        duration : 0.62,
        ease     : 'power3.inOut',
        onComplete() {
          gsap.to(logoEl, { opacity: 1, duration: 0.12 });
          gsap.to(mono,   { opacity: 0, duration: 0.12, onComplete: () => mono.remove() });
        },
      });
    })

    // Wipe the preloader upward — runs in parallel with the TJ flight
    .to(root, {
      clipPath : 'inset(100% 0 0 0)',
      duration : 0.78,
      ease     : 'power3.inOut',
      onComplete,
    }, '-=0.45');   // start wipe 0.45s into the flight

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div className="preloader" ref={rootRef}>
      <div className="preloader__grid" />

      <div className="preloader__inner">
        <div className="preloader__ring-wrap">
          <svg viewBox="0 0 120 120" className="preloader__svg" ref={svgRef}>
            <circle cx="60" cy="60" r="54" className="preloader__ring-bg" />
            <circle cx="60" cy="60" r="54" className="preloader__ring" ref={ringRef} />
          </svg>
          <div className="preloader__monogram" ref={monoRef}>TJ</div>
        </div>

        <div className="preloader__count-row" ref={countRowRef}>
          <span className="preloader__count" ref={countRef}>00</span>
          <span className="preloader__pct">%</span>
        </div>
      </div>

      <div className="preloader__bar-track">
        <div className="preloader__bar" ref={barRef} />
      </div>

      <span className="preloader__label">PORTFOLIO · JOEL TCHOUKE</span>
    </div>
  );
}

export default Preloader;
