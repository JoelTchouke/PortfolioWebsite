import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./../css/resume.css";

// ── Drop your two PDFs in /src/pdf/ and update these imports ──────
import resumeEmbedded from "./../pdf/JoelResume.pdf";          // Embedded Systems résumé
import resumeSoftware from "./../pdf/JoelResumeS.pdf";  // Software Engineering résumé
// ─────────────────────────────────────────────────────────────────

const RESUMES = [
  {
    id: "embedded",
    label: "Embedded Systems",
    eyebrow: "Hardware · Firmware · PCB",
    desc: "ARM microcontrollers, C/C++, KiCad, sensor integration, and low-level systems design.",
    file: resumeEmbedded,
    art: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="resumeCard__art">
        <rect x="30" y="30" width="60" height="60" rx="4" stroke="rgba(240,240,240,0.12)" strokeWidth="1.5"/>
        <rect x="42" y="42" width="36" height="36" rx="2" stroke="rgba(180,28,16,0.5)" strokeWidth="1"/>
        {[0,1,2,3].map(i=><line key={`t${i}`} x1="60" y1="30" x2="60" y2={15+i*4} stroke="rgba(240,240,240,0.18)" strokeWidth="1"/>)}
        {[0,1,2,3].map(i=><line key={`l${i}`} x1="30" y1="60" x2={15+i*4} y2="60" stroke="rgba(240,240,240,0.18)" strokeWidth="1"/>)}
        {[0,1,2,3].map(i=><line key={`b${i}`} x1="60" y1="90" x2="60" y2={101+i*4} stroke="rgba(240,240,240,0.18)" strokeWidth="1"/>)}
        {[0,1,2,3].map(i=><line key={`r${i}`} x1="90" y1="60" x2={101+i*4} y2="60" stroke="rgba(240,240,240,0.18)" strokeWidth="1"/>)}
        <circle cx="60" cy="60" r="6" fill="rgba(180,28,16,0.7)"/>
      </svg>
    ),
  },
  {
    id: "software",
    label: "Software Engineering",
    eyebrow: "React · Node · Systems",
    desc: "Full-stack web, Three.js, WebGL, Node.js, Python, and software architecture.",
    file: resumeSoftware,
    art: (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="resumeCard__art">
        <rect x="20" y="32" width="80" height="56" rx="3" stroke="rgba(240,240,240,0.12)" strokeWidth="1.5"/>
        <line x1="20" y1="46" x2="100" y2="46" stroke="rgba(240,240,240,0.08)" strokeWidth="1"/>
        <circle cx="32" cy="39" r="3" fill="rgba(180,28,16,0.6)"/>
        <circle cx="43" cy="39" r="3" fill="rgba(232,160,32,0.5)"/>
        <circle cx="54" cy="39" r="3" fill="rgba(60,180,60,0.4)"/>
        <text x="30" y="63" fill="rgba(28,106,180,0.8)" fontSize="9" fontFamily="monospace">{"<Joel"}</text>
        <text x="30" y="75" fill="rgba(240,240,240,0.25)" fontSize="9" fontFamily="monospace">{"  builds />"}</text>
        <text x="30" y="87" fill="rgba(28,106,180,0.5)" fontSize="9" fontFamily="monospace">{"</>"}</text>
      </svg>
    ),
  },
];

export default function Resume({ onNavigate }) {
  const sectionRef = useRef();
  const headerRef  = useRef();
  const viewerRef  = useRef();

  const [selected,  setSelected]  = useState(null);
  const [loaded,    setLoaded]    = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      [...headerRef.current.children],
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  // Lock scroll + escape key when fullscreen is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') { setSelected(null); setLoaded(false); } };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
    } else {
      document.body.style.overflow = '';
    }
  }, [selected]);

  const selectResume = (id) => {
    if (animating) return;
    if (selected === id) return;
    setAnimating(true);
    setLoaded(false);
    if (selected && viewerRef.current) {
      gsap.to(viewerRef.current, {
        opacity: 0, y: 12, duration: 0.3, ease: "power3.in",
        onComplete: () => { setSelected(id); setAnimating(false); },
      });
    } else {
      setSelected(id);
      setAnimating(false);
    }
  };

  const handleLoad = () => {
    setLoaded(true);
    if (viewerRef.current) {
      gsap.fromTo(viewerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  };

  const activeResume = RESUMES.find(r => r.id === selected);

  return (
    <section id="resume" ref={sectionRef} className="resumeSection">
      <div className="resumeSection__grid" aria-hidden="true" />

      {/* Header */}
      <div className="resumeHeader" ref={headerRef}>
        <div className="resumeHeader__left">
          <span className="resumeEyebrow">Résumé</span>
          <h2 className="resumeTitle">THE<br />FULL PICTURE.</h2>
        </div>
        <div className="resumeHeader__right">
          <p className="resumeDesc">
            Two résumés — pick the one<br />
            that fits what you're looking for.
          </p>
          {activeResume && (
            <a href={activeResume.file} download className="resumeDownloadBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v13M5 16l7 7 7-7"/><path d="M3 21h18"/>
              </svg>
              DOWNLOAD {activeResume.label.toUpperCase()}
            </a>
          )}
        </div>
      </div>

      <div className="resumeDivider" />

      {/* Selector cards */}
      <div className="resumeSelector">
        {RESUMES.map((r) => (
          <div
            key={r.id}
            className={`resumeCard${selected === r.id ? ' resumeCard--active' : ''}`}
            onClick={() => selectResume(r.id)}
          >
            {r.art}
            <div className="resumeCard__body">
              <p className="resumeCard__eyebrow">{r.eyebrow}</p>
              <h3 className="resumeCard__title">{r.label}</h3>
              <p className="resumeCard__desc">{r.desc}</p>
              <span className="resumeCard__cta">
                {selected === r.id ? 'VIEWING ↓' : 'VIEW RÉSUMÉ →'}
              </span>
            </div>
            <div className="resumeCard__activeLine" />
          </div>
        ))}
      </div>

      {/* PDF Viewer — fullscreen overlay */}
      {selected && (
        <div className="resumeFullscreen" ref={viewerRef} style={{ opacity: 0 }}>
          <div className="resumeViewer__scanlines" aria-hidden="true" />
          <span className="resumeCorner resumeCorner--tl" aria-hidden="true" />
          <span className="resumeCorner resumeCorner--tr" aria-hidden="true" />
          <span className="resumeCorner resumeCorner--bl" aria-hidden="true" />
          <span className="resumeCorner resumeCorner--br" aria-hidden="true" />

          <div className="resumeViewer__label">
            <div className="resumeViewer__label-left">
              <span className="resumeViewer__label-tag">// joel tchouke</span>
              <span className="resumeViewer__label-name">{activeResume?.label.toUpperCase()} RÉSUMÉ</span>
            </div>
            <div className="resumeViewer__label-right">
              {activeResume && (
                <a href={activeResume.file} download className="resumeDownloadBtn resumeDownloadBtn--sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v13M5 16l7 7 7-7"/><path d="M3 21h18"/>
                  </svg>
                  DOWNLOAD
                </a>
              )}
              <button className="resumeViewer__close" onClick={() => { setSelected(null); setLoaded(false); }}>
                ✕ CLOSE
              </button>
            </div>
          </div>

          {!loaded && (
            <div className="resumeViewer__loading">
              <span className="resumeViewer__loadingDot" />
              <span className="resumeViewer__loadingDot" />
              <span className="resumeViewer__loadingDot" />
            </div>
          )}

          <iframe
            key={selected}
            src={activeResume?.file}
            title={`Joel Tchouke — ${activeResume?.label} Résumé`}
            className="resumeIframe"
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={handleLoad}
          />
        </div>
      )}

      <div className="resumeFooter">
        <span>JOEL TCHOUKE — RÉSUMÉ</span>
        <span>MANKATO, MN · AVAILABLE FOR WORK</span>
      </div>
    </section>
  );
}