import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./../css/contact.css";

export default function Contact() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const sectionRef = useRef();
  const modalRef = useRef();
  const overlayRef = useRef();
  const panelRef = useRef();

  // Entrance animation for cards
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".contact__card");
    if (!cards) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  const openModal = () => {
    setModalOpen(true);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.94, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out", delay: 0.05 });
    });
  };

  const closeModal = () => {
    gsap.to(panelRef.current, { opacity: 0, scale: 0.96, y: 16, duration: 0.3, ease: "power3.in" });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.35, ease: "power2.in", delay: 0.05,
      onComplete: () => { setModalOpen(false); document.body.style.overflow = ""; }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { closeModal(); setSent(false); setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" }); }, 2000);
  };

  return (
    <>
      <section id="contact" ref={sectionRef} className="contactSection">
        <div className="contactSection__inner">

          {/* Card 1 — Get In Touch */}
          <div className="contact__card contact__card--touch" onClick={openModal}>
            <span className="contact__pill">1 minute</span>
            <h2 className="contact__heading">GET IN<br />TOUCH.</h2>
            <p className="contact__sub">
              Send a quick message — direct line to Joel.<br />
              Usually replied to the same day.
            </p>
            <div className="contact__cta">
              <span>OPEN FORM</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className="contact__card-art contact__card-art--touch" aria-hidden="true">
              <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Abstract hand/signal art */}
                <ellipse cx="100" cy="200" rx="55" ry="70" stroke="rgba(240,240,240,0.12)" strokeWidth="1.5" />
                <ellipse cx="100" cy="200" rx="32" ry="45" stroke="rgba(240,240,240,0.09)" strokeWidth="1" />
                <line x1="100" y1="60" x2="100" y2="130" stroke="rgba(240,240,240,0.18)" strokeWidth="2" strokeLinecap="round" />
                <path d="M70 90 Q100 60 130 90" stroke="rgba(180,28,16,0.55)" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M55 75 Q100 35 145 75" stroke="rgba(180,28,16,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="60" r="6" fill="rgba(180,28,16,0.7)" />
                {/* Brush stroke accent */}
                <path d="M40 240 Q80 225 120 245 Q150 258 170 238" stroke="rgba(180,28,16,0.45)" strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Card 2 — Email Direct */}
          <div className="contact__card contact__card--email">
            <span className="contact__pill">Direct</span>
            <h2 className="contact__heading">EMAIL<br />DIRECT.</h2>
            <p className="contact__sub">
              Prefer it simple? Drop a line straight<br />
              to the inbox — no middleman.
            </p>
            <a href="mailto:tchoukejoel@gmail.com" className="contact__cta contact__cta--link">
              <span>TCHOUKEJOEL@GMAIL.COM</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/joel-tchouke-197390280" className="contact__cta contact__cta--link">
              <span>LINKEDIN</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <div className="contact__card-art contact__card-art--email" aria-hidden="true">
              <svg viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Abstract envelope/grid art */}
                <rect x="30" y="100" width="140" height="100" rx="3" stroke="rgba(240,240,240,0.12)" strokeWidth="1.5" />
                <path d="M30 110 L100 165 L170 110" stroke="rgba(240,240,240,0.18)" strokeWidth="1.5" fill="none" />
                <line x1="30" y1="190" x2="80" y2="145" stroke="rgba(240,240,240,0.1)" strokeWidth="1" />
                <line x1="170" y1="190" x2="120" y2="145" stroke="rgba(240,240,240,0.1)" strokeWidth="1" />
                {/* Grid lines */}
                {[0,1,2,3].map(i => (
                  <line key={i} x1="30" y1={220 + i*15} x2={90 + i*20} y2={220 + i*15} stroke="rgba(240,240,240,0.07)" strokeWidth="1" />
                ))}
                <path d="M50 260 Q100 240 150 260" stroke="rgba(180,28,16,0.4)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Footer bar */}
          <div className="contactSection__footer">
            <span>© {new Date().getFullYear()} JOEL TCHOUKE. ALL RIGHTS RESERVED.</span>
            <span>MANKATO, MN</span>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="contactModal__overlay" ref={overlayRef}>
          <div className="contactModal__panel" ref={panelRef}>
            {/* Close button */}
            <button className="contactModal__close" onClick={closeModal} aria-label="Close">✕</button>

            {sent ? (
              <div className="contactModal__sent">
                <h2 className="contactModal__title">MESSAGE<br />SENT!</h2>
                <p className="contactModal__sentSub">Talk soon.</p>
              </div>
            ) : (
              <>
                <h2 className="contactModal__title">SAY<br />HELLO!</h2>
                <div className="contactModal__fields" onSubmit={handleSubmit}>
                  <div className="contactModal__row">
                    <div className="contactModal__group">
                      <label>First Name</label>
                      <input
                        type="text" placeholder="Joel"
                        value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="contactModal__group">
                      <label>Last Name</label>
                      <input
                        type="text" placeholder="Tchouke"
                        value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="contactModal__row">
                    <div className="contactModal__group">
                      <label>Email</label>
                      <input
                        type="email" placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div className="contactModal__group">
                      <label>Phone Number</label>
                      <input
                        type="tel" placeholder="(000) 000-0000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="contactModal__group contactModal__group--full">
                    <label>Your Message</label>
                    <textarea
                      rows={4} placeholder="Tell me what you're working on..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <button className="contactModal__send" onClick={handleSubmit}>SEND</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}