import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./../css/footer.css";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";

function GlitchText({ text, trigger }) {
  const [displayed, setDisplayed] = useState(text);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayed(
        text.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i < iteration) return text[i];
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join("")
      );
      if (iteration >= text.length) clearInterval(intervalRef.current);
      iteration += 0.4;
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [trigger, text]);

  return <span>{displayed}</span>;
}

export default function Footer({ onNavigate }) {
  const sectionRef  = useRef();
  const contentRef  = useRef();
  const [hovered, setHovered]   = useState(false);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const els = contentRef.current?.querySelectorAll('.footer__animate');
          if (els) {
            gsap.fromTo(els,
              { opacity: 0, y: 32 },
              { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }
            );
          }
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTerminalEnter = () => {
    setHovered(true);
    setGlitching(true);
    setTimeout(() => setGlitching(false), 900);
  };

  const handleTerminalClick = () => {
    onNavigate('terminal');
  };

  return (
    <section id="footer" ref={sectionRef} className="footerSection">

      {/* Background grid */}
      <div className="footerSection__grid" aria-hidden="true" />

      {/* Large background text */}
      <div className="footer__bgWord" aria-hidden="true">EOF</div>

      <div className="footerSection__inner" ref={contentRef}>

        {/* Top — identity block */}
        <div className="footer__top footer__animate">
          <div className="footer__logo">TJ</div>
          <div className="footer__tagline">
            <span>JOEL TCHOUKE</span>
            <span className="footer__dot" />
            <span>ENGINEER · BUILDER · THINKER</span>
          </div>
        </div>

        <div className="footer__divider footer__animate" />

        {/* Middle — easter egg block */}
        <div className="footer__eggBlock footer__animate">
          <div className="footer__eggLeft">
            <p className="footer__eggEyebrow">// classified</p>
            <h2 className="footer__eggHeading">
              Something is<br />
              <em>hidden</em> here.
            </h2>
            <p className="footer__eggSub">
              Somewhere in this site, Joel planted a secret.<br />
              If you're the type who reads source code for fun —<br />
              this one's for you.
            </p>
            <p className="footer__eggSub footer__eggSub--hint">
              Find it. Screenshot it. Email it.<br />
              <span className="footer__red">The One Piece is real.</span>
            </p>
          </div>

          <div className="footer__eggRight">
            {/* Terminal launch card */}
            <button
              className={`footer__terminalCard${hovered ? ' footer__terminalCard--active' : ''}`}
              onClick={handleTerminalClick}
              onMouseEnter={handleTerminalEnter}
              onMouseLeave={() => setHovered(false)}
              aria-label="Launch terminal"
            >
              <div className="footer__terminalCard__top">
                <span className="footer__terminalCard__dot" style={{ background: '#ff5f57' }} />
                <span className="footer__terminalCard__dot" style={{ background: '#febc2e' }} />
                <span className="footer__terminalCard__dot" style={{ background: '#28c840' }} />
                <span className="footer__terminalCard__title">bash — tchouke@portfolio</span>
              </div>
              <div className="footer__terminalCard__body">
                <p className="footer__terminalCard__line">
                  <span className="footer__terminalCard__prompt">$</span>
                  <GlitchText text="./investigate --find-secret" trigger={glitching} />
                  <span className="footer__terminalCard__cursor" />
                </p>
                <p className="footer__terminalCard__output">Initializing hunt...</p>
                <p className="footer__terminalCard__output footer__terminalCard__output--dim">
                  Access granted. Good luck.
                </p>
              </div>
              <div className="footer__terminalCard__cta">
                LAUNCH TERMINAL
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div className="footer__divider footer__animate" />

        {/* Bottom — actual footer links + copyright */}
        <div className="footer__bottom footer__animate">
          <span className="footer__copy">© {new Date().getFullYear()} JOEL TCHOUKE. ALL RIGHTS RESERVED.</span>
          <div className="footer__links">
            <a href="mailto:tchoukejoel@gmail.com">EMAIL</a>
            <span className="footer__dot" />
            <a href="https://github.com/JoelTchouke" target="_blank" rel="noreferrer">GITHUB</a>
            <span className="footer__dot" />
            <a href="https://linkedin.com/in/joel-tchouke-197390280/" target="_blank" rel="noreferrer">LINKEDIN</a>
            <span className="footer__dot" />
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('main'); }}>BACK TO TOP ↑</a>
          </div>
        </div>

      </div>
    </section>
  );
}