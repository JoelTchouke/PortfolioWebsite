import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./../css/contact.css";

/*
  ══════════════════════════════════════════════════════
  SETUP — do this once before deploying:

  1. EMAIL (EmailJS — free, no backend needed)
     a. Go to https://www.emailjs.com and create an account
     b. Add an Email Service (Gmail recommended) → copy SERVICE_ID
     c. Create an Email Template with these variables:
          {{from_name}}, {{from_email}}, {{phone}}, {{message}}
        Copy TEMPLATE_ID
     d. Go to Account → copy PUBLIC_KEY
     e. Fill in the three constants below

  2. SMS (optional — via your own backend or Twilio serverless function)
     a. Create a Twilio account at https://twilio.com
     b. Get a phone number, copy ACCOUNT_SID + AUTH_TOKEN
     c. Deploy a small serverless function (Twilio Functions or Vercel)
        that calls the Twilio SMS API — see SMS_ENDPOINT note below
     d. Set SMS_ENDPOINT to that function URL
     e. Set YOUR_PHONE to your number in E.164 format e.g. +15071234567

  To skip SMS: set SMS_ENABLED = false
  ══════════════════════════════════════════════════════
*/

// ── CONFIG ────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // from EmailJS dashboard
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // from EmailJS dashboard
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // from EmailJS Account tab

const SMS_ENABLED  = false;                      // set true once backend ready
const SMS_ENDPOINT = 'https://your-api.com/sms'; // your serverless function URL
const YOUR_PHONE   = '+19293397034';             // your number in E.164 format
// ─────────────────────────────────────────────────────

// Lazy-load EmailJS SDK
let emailjsLoaded = false;
const loadEmailJS = () => new Promise((resolve) => {
  if (emailjsLoaded || window.emailjs) { resolve(window.emailjs); return; }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    emailjsLoaded = true;
    resolve(window.emailjs);
  };
  document.head.appendChild(s);
});

export default function Contact() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const sectionRef = useRef();
  const modalRef   = useRef();
  const overlayRef = useRef();
  const panelRef   = useRef();

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.contact__card');
    if (!cards) return;
    gsap.fromTo(cards,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  const openModal = () => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.94, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 });
    });
  };

  const closeModal = () => {
    gsap.to(panelRef.current, { opacity: 0, scale: 0.96, y: 16, duration: 0.3, ease: 'power3.in' });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.35, ease: 'power2.in', delay: 0.05,
      onComplete: () => {
        setModalOpen(false);
        document.body.style.overflow = '';
        setStatus('idle');
        setForm({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault?.();
    if (status === 'sending') return;

    // Basic validation
    if (!form.firstName || !form.email || !form.message) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
      return;
    }

    setStatus('sending');

    try {
      // ── 1. Send email via EmailJS ──────────────────────────────────────────
      const ejs = await loadEmailJS();
      await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:   `${form.firstName} ${form.lastName}`.trim(),
        from_email:  form.email,
        phone:       form.phone || 'Not provided',
        message:     form.message,
        reply_to:    form.email,
      });

      // ── 2. Send SMS (optional) ─────────────────────────────────────────────
      if (SMS_ENABLED) {
        try {
          await fetch(SMS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to:   YOUR_PHONE,
              body: `New portfolio message from ${form.firstName} ${form.lastName} (${form.email}):\n\n${form.message}`,
            }),
          });
        } catch (smsErr) {
          // SMS failure is non-fatal — email already sent
          console.warn('SMS failed (email still sent):', smsErr);
        }
      }

      setStatus('sent');
      setTimeout(() => closeModal(), 2200);

    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
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
                <ellipse cx="100" cy="200" rx="55" ry="70" stroke="rgba(240,240,240,0.12)" strokeWidth="1.5" />
                <ellipse cx="100" cy="200" rx="32" ry="45" stroke="rgba(240,240,240,0.09)" strokeWidth="1" />
                <line x1="100" y1="60" x2="100" y2="130" stroke="rgba(240,240,240,0.18)" strokeWidth="2" strokeLinecap="round" />
                <path d="M70 90 Q100 60 130 90" stroke="rgba(180,28,16,0.55)" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M55 75 Q100 35 145 75" stroke="rgba(180,28,16,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="60" r="6" fill="rgba(180,28,16,0.7)" />
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
                <rect x="30" y="100" width="140" height="100" rx="3" stroke="rgba(240,240,240,0.12)" strokeWidth="1.5" />
                <path d="M30 110 L100 165 L170 110" stroke="rgba(240,240,240,0.18)" strokeWidth="1.5" fill="none" />
                <line x1="30" y1="190" x2="80" y2="145" stroke="rgba(240,240,240,0.1)" strokeWidth="1" />
                <line x1="170" y1="190" x2="120" y2="145" stroke="rgba(240,240,240,0.1)" strokeWidth="1" />
                {[0,1,2,3].map(i => (
                  <line key={i} x1="30" y1={220 + i*15} x2={90 + i*20} y2={220 + i*15} stroke="rgba(240,240,240,0.07)" strokeWidth="1" />
                ))}
                <path d="M50 260 Q100 240 150 260" stroke="rgba(180,28,16,0.4)" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
          </div>

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
            <button className="contactModal__close" onClick={closeModal} aria-label="Close">✕</button>

            {status === 'sent' ? (
              <div className="contactModal__sent">
                <h2 className="contactModal__title">MESSAGE<br />SENT!</h2>
                <p className="contactModal__sentSub">Talk soon.</p>
              </div>
            ) : (
              <>
                <h2 className="contactModal__title">SAY<br />HELLO!</h2>

                {status === 'error' && (
                  <p className="contactModal__error">
                    {!form.firstName || !form.email || !form.message
                      ? 'Please fill in name, email and message.'
                      : 'Something went wrong. Try emailing directly.'}
                  </p>
                )}

                <div className="contactModal__fields">
                  <div className="contactModal__row">
                    <div className="contactModal__group">
                      <label>First Name *</label>
                      <input type="text" placeholder="Joel"
                        value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div className="contactModal__group">
                      <label>Last Name</label>
                      <input type="text" placeholder="Tchouke"
                        value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="contactModal__row">
                    <div className="contactModal__group">
                      <label>Email *</label>
                      <input type="email" placeholder="you@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="contactModal__group">
                      <label>Phone Number</label>
                      <input type="tel" placeholder="(000) 000-0000"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div className="contactModal__group contactModal__group--full">
                    <label>Your Message *</label>
                    <textarea rows={4} placeholder="Tell me what you're working on..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>

                  <button
                    className={`contactModal__send${status === 'sending' ? ' contactModal__send--loading' : ''}`}
                    onClick={handleSubmit}
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'SENDING...' : 'SEND'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}