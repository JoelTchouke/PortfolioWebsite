import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./../css/resume.css";
import resume from "./../pdf/JoelResume.pdf";

export default function Resume({ onNavigate }) {
  const sectionRef  = useRef();
  const frameRef    = useRef();
  const headerRef   = useRef();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    gsap.fromTo(
      [...header.children],
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    gsap.fromTo(frameRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  };

  return (
    <section id="resume" ref={sectionRef} className="resumeSection">

      {/* Background grid — same as contact section */}
      <div className="resumeSection__grid" aria-hidden="true" />

      {/* Header row */}
      <div className="resumeHeader" ref={headerRef}>
        <div className="resumeHeader__left">
          <span className="resumeEyebrow">Résumé</span>
          <h2 className="resumeTitle">THE<br />FULL PICTURE.</h2>
        </div>
        <div className="resumeHeader__right">
          <p className="resumeDesc">
            A snapshot of where I've been,<br />
            what I've built, and what I know.
          </p>
          <a
            href={resume}
            download
            className="resumeDownloadBtn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v13M5 16l7 7 7-7" />
              <path d="M3 21h18" />
            </svg>
            DOWNLOAD PDF
          </a>
        </div>
      </div>

      {/* Divider line */}
      <div className="resumeDivider" />

      {/* PDF viewer */}
      <div className="resumeViewer">
        {/* Scanline overlay for aesthetic */}
        <div className="resumeViewer__scanlines" aria-hidden="true" />

        {/* Corner brackets */}
        <span className="resumeCorner resumeCorner--tl" aria-hidden="true" />
        <span className="resumeCorner resumeCorner--tr" aria-hidden="true" />
        <span className="resumeCorner resumeCorner--bl" aria-hidden="true" />
        <span className="resumeCorner resumeCorner--br" aria-hidden="true" />

        {!loaded && (
          <div className="resumeViewer__loading">
            <span className="resumeViewer__loadingDot" />
            <span className="resumeViewer__loadingDot" />
            <span className="resumeViewer__loadingDot" />
          </div>
        )}

        <iframe
          ref={frameRef}
          src={resume}
          title="Joel Tchouke — Résumé"
          className="resumeIframe"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={handleLoad}
        />
      </div>

      {/* Footer row */}
      <div className="resumeFooter">
        <span>JOEL TCHOUKE — RÉSUMÉ</span>
        <span>MANKATO, MN · AVAILABLE FOR WORK</span>
      </div>

    </section>
  );
}