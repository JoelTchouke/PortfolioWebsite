import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import "../App.css";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Text, useProgress } from "@react-three/drei";
import "../css/honorScene.css";
import { useSpring, animated } from "@react-spring/three";
import JoelImg from "../img/joelG.PNG";
import * as THREE from "three";
import finder from "../img/finder.png";
// All other images are loaded lazily via useLazyImages / GALLERY_ITEMS.lazy

const FrameFocusContext = createContext();

// ══════════════════════════════════════════════════════════════════
//  ARTIFACTS — add your files here per section
//
//  type: 'image' | 'pdf' | 'video'
//
//  image: { type:'image', label:'...', path:'/Experiences/...jpg', thumb:'/Experiences/...jpg' }
//  pdf:   { type:'pdf',   label:'...', path:'/Experiences/...pdf', thumb: null }
//  video: { type:'video', label:'...', path:'/Experiences/...mp4', thumb: null }
//         (video also accepts YouTube: path:'https://www.youtube.com/embed/VIDEO_ID')
// ══════════════════════════════════════════════════════════════════
const ARTIFACTS = {
  honors: [
    {
      type: "pdf",
      label: "Why Honors — 201",
      path: "/Experiences/honors201.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Why Honors — 375",
      path: "/Experiences/honors375.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Why Honors — 475 (Synthesis Essay)",
      path: "/Experiences/Why Honors 475.pdf",
      thumb: null,
    },
  ],
  research: [
    {
      type: "pdf",
      label: "Research Reflection",
      path: "/Experiences/Research/PowerCell.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Research Reflection",
      path: "/Experiences/Research/SeniorResearch.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Research Reflection",
      path: "/Experiences/Research/SmartGlasses.pdf",
      thumb: null,
    },
  ],
  leadership: [
    {
      type: "pdf",
      label: "Identity Leadership",
      path: "/Experiences/Leadership/Identity.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Organizational Leadership",
      path: "/Experiences/Leadership/Organizational.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Instructional Leadership",
      path: "/Experiences/Leadership/Instructional.pdf",
      thumb: null,
    },
    {
      type: "image",
      label: "Strength Finder Report",
      path: finder,
      thumb: finder,
    },
  ],
  intercultural: [
    {
      type: "pdf",
      label: "Intercultural Reflection",
      path: "/Experiences/Intercultural/GlobalAmbassador.pdf",
      thumb: null,
    },
    {
      type: "pdf",
      label: "Intercultural Reflection",
      path: "/Experiences/Intercultural/StudyingAbroad.pdf",
      thumb: null,
    },
  ],
};

// ══════════════════════════════════════════════════════════════════
//  GALLERY — master visual archive
//  Images use lazy:()=>import("path") — they are only downloaded
//  when the Gallery page opens, keeping initial load lightweight.
//  PDFs keep path: string (static assets, no webpack bundling).
// ══════════════════════════════════════════════════════════════════
const GALLERY_ITEMS = [
  // ── Photos ────────────────────────────────────────────────────────
  { type:"image", category:"photos", label:"Portrait",                       lazy:()=>import("../img/joelG.PNG"),          placeholder:false },
  { type:"image", category:"photos", label:"Professional Headshot",          lazy:()=>import("../img/JoelT.png"),          placeholder:false },
  { type:"image", category:"photos", label:"Studio Headshot",                lazy:()=>import("../img/JoelT2.jpg"),         placeholder:false },
  { type:"image", category:"photos", label:"Denim Jacket Portrait",          lazy:()=>import("../img/JoelT3.jpg"),         placeholder:false },
  { type:"image", category:"photos", label:"Campus Photoshoot",              lazy:()=>import("../img/3.jpg"),              placeholder:false },
  { type:"image", category:"photos", label:"Street Portrait",                lazy:()=>import("../img/headshot1.JPG"),      placeholder:false },
  { type:"image", category:"photos", label:"Reflective Moment",              lazy:()=>import("../img/IMG_1409.JPG"),       placeholder:false },
  { type:"image", category:"photos", label:"Playing Guitar",                 lazy:()=>import("../img/about1.jpeg"),        placeholder:false },
  { type:"image", category:"photos", label:"Playing Keyboard",               lazy:()=>import("../img/Image (25).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Riverside Terrace",              lazy:()=>import("../img/Image (5).jpg"),      placeholder:false },
  { type:"image", category:"photos", label:"Sunset Terrace",                 lazy:()=>import("../img/Image (6).jpg"),      placeholder:false },
  { type:"image", category:"photos", label:"Street Art Mural",               lazy:()=>import("../img/Image (11).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"With a Friend",                  lazy:()=>import("../img/Image (12).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Professional Portrait",          lazy:()=>import("../img/Image (13).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Nature Walk",                    lazy:()=>import("../img/Image (34).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Colorful Mural Jump",            lazy:()=>import("../img/Image (35).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Minnesota State University",     lazy:()=>import("../img/Image (36).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Friends in the City",            lazy:()=>import("../img/Image (37).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Road Trip",                      lazy:()=>import("../img/Image (38).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Ice Castles",                    lazy:()=>import("../img/Image (40).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"First Minnesota Winter",         lazy:()=>import("../img/Image (41).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Dining with Friends",            lazy:()=>import("../img/Image (33).jpg"),     placeholder:false },
  { type:"image", category:"photos", label:"Photo Walk",                     lazy:()=>import("../img/9.jpg"),              placeholder:false },
  // ── Events ────────────────────────────────────────────────────────
  { type:"image", category:"events", label:"Cultural Stage Performance",          lazy:()=>import("../img/2.JPG"),           placeholder:false },
  { type:"image", category:"events", label:"Casino Night — Arcade Games",         lazy:()=>import("../img/Image.jpg"),        placeholder:false },
  { type:"image", category:"events", label:"Casino Night — Card Tables",          lazy:()=>import("../img/Image (1).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"Live Concert Performance",            lazy:()=>import("../img/Image (2).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"IEEE Rising Stars — With Banner",     lazy:()=>import("../img/Image (3).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"Event Group Photo",                   lazy:()=>import("../img/Image (4).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"Ethiopian Food Experience",           lazy:()=>import("../img/Image (7).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"Taylor Guitars Factory Visit",        lazy:()=>import("../img/Image (8).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"After the Show",                      lazy:()=>import("../img/Image (9).jpg"),   placeholder:false },
  { type:"image", category:"events", label:"Open Mic Night",                      lazy:()=>import("../img/Image (14).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Summer Carnival",                     lazy:()=>import("../img/Image (18).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Kato Escape Room",                    lazy:()=>import("../img/Image (23).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Men's Group Winter Retreat",          lazy:()=>import("../img/Image (24).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Recording Studio Session",            lazy:()=>import("../img/Image (26).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Holiday Photo with Santa",            lazy:()=>import("../img/Image (27).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Valleyfair Fun Day",                  lazy:()=>import("../img/Image (32).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"Ice Caves Adventure",                 lazy:()=>import("../img/Image (39).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"MavPASS Group Session",               lazy:()=>import("../img/Image (43).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"MavPASS End-of-Semester Recognition", lazy:()=>import("../img/Image (44).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"NCUR 2025 Conference",                lazy:()=>import("../img/Image (42).jpg"),  placeholder:false },
  { type:"image", category:"events", label:"NSBE Annual Convention 2026",         lazy:()=>import("../img/IMG_6921.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"NSBE Convention — Convention Floor",  lazy:()=>import("../img/about2.jpeg"),     placeholder:false },
  { type:"image", category:"events", label:"IEEE Rising Stars — Group",           lazy:()=>import("../img/IMG_0755.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"IEEE Rising Stars — Ceremony",        lazy:()=>import("../img/IMG_0773.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"IEEE Rising Stars — Conference",      lazy:()=>import("../img/IMG_4537.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"IEEE Conference Networking",          lazy:()=>import("../img/IMG_2360.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"Organization Milestone Event",        lazy:()=>import("../img/IMG_8706.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"Professional Conference",             lazy:()=>import("../img/IMG_9236.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"Las Vegas — IEEE Rising Stars Trip",  lazy:()=>import("../img/IMG_0630.jpeg"),   placeholder:false },
  { type:"image", category:"events", label:"Cameroonian Heritage Day",            lazy:()=>import("../img/6.jpg"),           placeholder:false },
  { type:"image", category:"events", label:"Cameroonian Heritage Day II",         lazy:()=>import("../img/7.jpg"),           placeholder:false },
  // ── Intercultural ─────────────────────────────────────────────────
  { type:"image", category:"intercultural", label:"Cenote Snorkeling — Mexico",         lazy:()=>import("../img/1.JPG"),            placeholder:false },
  { type:"image", category:"intercultural", label:"Tulum — Mayan Ruins with Friends",   lazy:()=>import("../img/4.jpg"),            placeholder:false },
  { type:"image", category:"intercultural", label:"Tulum — Mayan Temple",               lazy:()=>import("../img/Image (19).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Tulum — Group at the Ruins",         lazy:()=>import("../img/Image (20).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Mayan Ruins — White Sands",          lazy:()=>import("../img/5.jpg"),            placeholder:false },
  { type:"image", category:"intercultural", label:"Horseback Riding — Tropical Forest", lazy:()=>import("../img/8.JPG"),            placeholder:false },
  { type:"image", category:"intercultural", label:"Horseback Riding — Jungle Trail",    lazy:()=>import("../img/Image (21).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Horseback Riding — Jungle Path",     lazy:()=>import("../img/Image (22).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Cameroonian Heritage — Flag March",  lazy:()=>import("../img/Image (15).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Cameroonian Heritage — Full Flag",   lazy:()=>import("../img/Image (16).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Campus Cameroon Flag Walk",          lazy:()=>import("../img/Image (17).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"ISA International Parade",           lazy:()=>import("../img/Image (28).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Cultural Flag Parade — Downtown",    lazy:()=>import("../img/Image (29).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"African Nations Gathering",          lazy:()=>import("../img/Image (30).jpg"),   placeholder:false },
  { type:"image", category:"intercultural", label:"Côte d'Ivoire & Cameroon Flags",    lazy:()=>import("../img/Image (31).jpg"),   placeholder:false },
  // ── Documents ─────────────────────────────────────────────────────
  { type:"pdf", category:"documents", label:"Why Honors — 201",             path:"/Experiences/honors201.pdf",                   thumb:null, placeholder:false },
  { type:"pdf", category:"documents", label:"Why Honors — 375",             path:"/Experiences/honors375.pdf",                   thumb:null, placeholder:false },
  { type:"pdf", category:"documents", label:"Why Honors — 475 (Synthesis)", path:"/Experiences/Why Honors 475.pdf",              thumb:null, placeholder:false },
  { type:"pdf", category:"documents", label:"Research Reflection",          path:"/Experiences/Research/Research.pdf",           thumb:null, placeholder:false },
  { type:"pdf", category:"documents", label:"Leadership Reflection",        path:"/Experiences/Leadership/Leadership2.pdf",      thumb:null, placeholder:false },
  { type:"pdf", category:"documents", label:"ISA / ASA Reflection",         path:"/Experiences/Leadership/Leadership.pdf",       thumb:null, placeholder:false },
  { type:"pdf", category:"documents", label:"Intercultural Reflection",     path:"/Experiences/Intercultural/Intercultural.pdf", thumb:null, placeholder:false },
  // ── Certificates ──────────────────────────────────────────────────
  { type:"image", category:"certificates", label:"StrengthsFinder Report", path:finder, thumb:finder, placeholder:false },
  { type:"image", category:"certificates", label:"Academic Award",          path:null, thumb:null, placeholder:true, note:"Upload certificates, awards, or recognitions" },
  { type:"image", category:"certificates", label:"Honors Recognition",      path:null, thumb:null, placeholder:true, note:"Honors program completion or achievement certificate" },
  // ── Projects ──────────────────────────────────────────────────────
  { type:"image", category:"projects", label:"Embedded Systems — Breadboard",     lazy:()=>import("../img/IMG_1214.jpeg"),  placeholder:false },
  { type:"image", category:"projects", label:"Embedded Systems — Component Test", lazy:()=>import("../img/Image (10).jpg"), placeholder:false },
  { type:"image", category:"projects", label:"Senior Capstone — Control System",  lazy:()=>import("../img/IMG_1479.jpeg"),  placeholder:false },
  { type:"image", category:"projects", label:"NCUR — Research Presentation",      lazy:()=>import("../img/image.png"),      placeholder:false },
  { type:"image", category:"projects", label:"Senior Capstone — Research Poster", lazy:()=>import("../img/IMG_0444.JPG"),  placeholder:false },
  { type:"video", category:"projects", label:"Project Demo Video",                 path:null, thumb:null, placeholder:true, note:"Demo recording or YouTube embed link" },
  { type:"pdf",   category:"projects", label:"Technical Report",                   path:null, thumb:null, placeholder:true, note:"Research paper, lab report, or capstone document" },
];

// ── Scene loader ──────────────────────────────────────────────────
function SceneLoader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Anton','Impact',sans-serif",
          fontSize: "6rem",
          fontWeight: 900,
          color: "rgba(240,240,240,0.88)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {Math.round(progress)}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: "0.55rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(240,240,240,0.32)",
          marginTop: "0.8rem",
        }}
      >
        LOADING GALLERY
      </div>
      <div
        style={{
          width: 180,
          height: 1,
          background: "rgba(240,240,240,0.08)",
          marginTop: "2.4rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "#b41c10",
            width: `${progress}%`,
            transition: "width 0.15s linear",
          }}
        />
      </div>
    </div>
  );
}

// ── Type icons ────────────────────────────────────────────────────
const PDFIcon = () => (
  <svg
    viewBox="0 0 40 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 36, height: 44 }}
  >
    <rect
      x="1"
      y="1"
      width="30"
      height="42"
      rx="2"
      stroke="rgba(240,240,240,0.2)"
      strokeWidth="1.5"
    />
    <path
      d="M9 1v12h22"
      stroke="rgba(240,240,240,0.2)"
      strokeWidth="1.5"
      fill="none"
    />
    <line x1="7" y1="22" x2="25" y2="22" stroke="#b41c10" strokeWidth="1.5" />
    <line
      x1="7"
      y1="28"
      x2="25"
      y2="28"
      stroke="rgba(240,240,240,0.15)"
      strokeWidth="1.5"
    />
    <line
      x1="7"
      y1="34"
      x2="18"
      y2="34"
      stroke="rgba(240,240,240,0.15)"
      strokeWidth="1.5"
    />
  </svg>
);

const VideoIcon = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 40, height: 40 }}
  >
    <rect
      x="1"
      y="8"
      width="34"
      height="32"
      rx="3"
      stroke="rgba(240,240,240,0.2)"
      strokeWidth="1.5"
    />
    <path
      d="M35 18l11-8v28l-11-8V18z"
      stroke="rgba(240,240,240,0.2)"
      strokeWidth="1.5"
      fill="none"
    />
    <circle
      cx="17"
      cy="24"
      r="7"
      stroke="rgba(240,240,240,0.12)"
      strokeWidth="1"
    />
    <path d="M14 21l7 3-7 3V21z" fill="#b41c10" />
  </svg>
);

// ── Lightbox ──────────────────────────────────────────────────────
function Lightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const [loaded, setLoaded] = useState(false);
  const item = items[idx];
  const isYT = item.type === "video" && item.path.includes("youtube.com");

  useEffect(() => {
    setLoaded(false);
  }, [idx]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setIdx((i) => Math.min(i + 1, items.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, onClose]);

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="lb-header">
          <span className="lb-counter">
            {idx + 1} / {items.length}
          </span>
          <span className="lb-title">{item.label}</span>
          <button className="lb-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="lb-content">
          {!loaded && (
            <div className="lb-loading">
              <span />
              <span />
              <span />
            </div>
          )}

          {item.type === "image" && (
            <img
              src={item.path}
              alt={item.label}
              className="lb-image"
              style={{ opacity: loaded ? 1 : 0 }}
              onLoad={() => setLoaded(true)}
            />
          )}

          {item.type === "pdf" && (
            <iframe
              src={item.path}
              title={item.label}
              className="lb-iframe"
              style={{ opacity: loaded ? 1 : 0 }}
              onLoad={() => setLoaded(true)}
            />
          )}

          {item.type === "video" && isYT && (
            <iframe
              src={item.path}
              title={item.label}
              className="lb-iframe lb-iframe--video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ opacity: loaded ? 1 : 0 }}
              onLoad={() => setLoaded(true)}
            />
          )}

          {item.type === "video" && !isYT && (
            <video
              src={item.path}
              className="lb-video"
              controls
              autoPlay
              style={{ opacity: loaded ? 1 : 0 }}
              onCanPlay={() => setLoaded(true)}
            />
          )}
        </div>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <div className="lb-nav">
            <button
              className="lb-nav__btn"
              onClick={() => setIdx((i) => Math.max(i - 1, 0))}
              disabled={idx === 0}
            >
              ←
            </button>
            <div className="lb-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  className={`lb-dot${i === idx ? " lb-dot--active" : ""}`}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
            <button
              className="lb-nav__btn"
              onClick={() => setIdx((i) => Math.min(i + 1, items.length - 1))}
              disabled={idx === items.length - 1}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Artifact gallery ──────────────────────────────────────────────
function ArtifactGallery({ items }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const open = (i) => {
    setStartIndex(i);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="ag-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className={`ag-card ag-card--${item.type}`}
            onClick={() => open(i)}
          >
            {/* Thumb */}
            <div className="ag-card__thumb">
              {item.type === "image" && item.thumb ? (
                <img src={item.thumb} alt={item.label} />
              ) : item.type === "video" ? (
                <>
                  <VideoIcon />
                  <span className="ag-card__play">▶</span>
                </>
              ) : (
                <PDFIcon />
              )}
              {/* Hover reveal */}
              <div className="ag-card__reveal">
                <span className="ag-card__reveal-text">OPEN</span>
              </div>
            </div>

            {/* Footer */}
            <div className="ag-card__footer">
              <span className="ag-card__label">{item.label}</span>
              <span className={`ag-card__badge ag-card__badge--${item.type}`}>
                {item.type.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <Lightbox
          items={items}
          startIndex={startIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// ── Placeholder slot ─────────────────────────────────────────────
function PlaceholderSlot({ label, note }) {
  return (
    <div className="hp-placeholder">
      <span className="hp-placeholder__icon">+</span>
      <div style={{ flex: 1 }}>
        <div className="hp-placeholder__label">{label}</div>
        {note && <div className="hp-placeholder__note">{note}</div>}
      </div>
      <span className="hp-placeholder__badge">COMING SOON</span>
    </div>
  );
}

// ── Lazy image hook ────────────────────────────────────────────────
// Dynamically imports a named set of images only when the component
// mounts (i.e. when the user opens that section). This avoids
// downloading all photos before the page content even renders.
function useLazyImages(importMap) {
  const [imgs, setImgs] = useState({});
  useEffect(() => {
    let alive = true;
    Promise.all(
      Object.entries(importMap).map(([key, fn]) =>
        fn()
          .then((m) => [key, m.default])
          .catch(() => [key, null])
      )
    ).then((pairs) => {
      if (alive) setImgs(Object.fromEntries(pairs));
    });
    return () => {
      alive = false;
    };
    // importMap is a stable object literal defined once per render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return imgs;
}

// Build a photo item; shows as a skeleton placeholder until src resolves
function lp(src, label) {
  return {
    type: "image",
    label,
    path: src || null,
    thumb: src || null,
    placeholder: !src,
    note: !src ? "Loading…" : undefined,
  };
}

// ── Photo strip ───────────────────────────────────────────────────
function PhotoStrip({ items }) {
  const [lbItems, setLbItems] = useState(null);
  const [lbStart, setLbStart] = useState(0);
  if (!items || items.length === 0) return null;
  const realItems = items.filter((i) => !i.placeholder && i.path);
  const open = (item) => {
    if (item.placeholder || !item.path) return;
    setLbItems(realItems);
    setLbStart(Math.max(realItems.indexOf(item), 0));
  };
  return (
    <>
      <div className="photo-strip">
        {items.map((item, i) => (
          <div
            key={i}
            className={`photo-strip__card${item.placeholder ? " photo-strip__card--placeholder" : ""}`}
            onClick={() => open(item)}
            title={item.placeholder && item.note ? item.note : undefined}
          >
            <div className="photo-strip__thumb">
              {item.path ? (
                <img
                  src={item.thumb || item.path}
                  alt={item.label}
                  className="photo-strip__img"
                  loading="lazy"
                />
              ) : (
                <div className="photo-strip__blank">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(240,240,240,0.1)"
                    strokeWidth="1.2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle
                      cx="8.5"
                      cy="8.5"
                      r="1.5"
                      fill="rgba(240,240,240,0.08)"
                      stroke="none"
                    />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  {item.note && (
                    <span className="photo-strip__hint">{item.note}</span>
                  )}
                </div>
              )}
              {!item.placeholder && (
                <div className="photo-strip__reveal">
                  <span>VIEW</span>
                </div>
              )}
            </div>
            <div className="photo-strip__footer">
              <span className="photo-strip__label">{item.label}</span>
              {item.placeholder && (
                <span className="photo-strip__add">+ ADD</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {lbItems && (
        <Lightbox
          items={lbItems}
          startIndex={lbStart}
          onClose={() => setLbItems(null)}
        />
      )}
    </>
  );
}

// ── Section block ─────────────────────────────────────────────────
function SectionBlock({ label, title, text, photos, children }) {
  return (
    <div className="hp-section">
      {label && <p className="hp-section__label">{label}</p>}
      {title && <h3 className="hp-section__title">{title}</h3>}
      {text && <p className="hp-section__text">{text}</p>}
      {photos && photos.length > 0 && <PhotoStrip items={photos} />}
      {children}
    </div>
  );
}

// ── Camera control ────────────────────────────────────────────────
function CameraControl({ target }) {
  const { camera } = useThree();
  const tp = useRef(new THREE.Vector3(0, 0, 8));
  const tl = useRef(new THREE.Vector3(0, 0, 0));
  const cl = useRef(new THREE.Vector3(0, 0, 0));
  useEffect(() => {
    if (target === "frames") {
      tp.current.set(-1, 0, 0);
      tl.current.set(-5, 0, 0);
    } else if (target === "books") {
      tp.current.set(-2, -1, 5);
      tl.current.set(0, 0, 0);
    } else {
      tp.current.set(0, 0, 8);
      tl.current.set(0, 0, 0);
    }
  }, [target]);
  useFrame(() => {
    camera.position.lerp(tp.current, 0.05);
    cl.current.lerp(tl.current, 0.05);
    camera.lookAt(cl.current);
  });
  return <OrbitControls enablePan={false} enableZoom={false} />;
}

// ── Frame mesh ────────────────────────────────────────────────────
function FrameExperiences({
  position,
  scale,
  imageUrl,
  name,
  args,
  text,
  label,
  onHover,
}) {
  const textRef = useRef();
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const [tv, setTv] = useState(0);
  const { targetFocus } = useContext(FrameFocusContext);
  useEffect(() => {
    if (textRef.current) textRef.current.rotation.y = Math.PI / 2;
  }, []);
  useEffect(() => {
    setTv(targetFocus === "frames" ? 1 : 0);
  }, [targetFocus]);
  return (
    <mesh
      name={name}
      scale={scale}
      position={position}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        onHover && onHover(label || null);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onHover && onHover(null);
      }}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial map={texture} />
      <Text
        ref={textRef}
        position={[0, -1.5, 0]}
        scale={0.4}
        color="#e8e8e8"
        fillOpacity={tv}
      >
        {text}
      </Text>
    </mesh>
  );
}

// ── Scene ─────────────────────────────────────────────────────────
function Scene({ setClicked, setHovered, setGallery }) {
  const room = useGLTF("/3DModels/scene.gltf");
  const { scene } = useThree();
  const { targetFocus, setTargetFocus } = useContext(FrameFocusContext);
  useEffect(() => {
    scene.fog = new THREE.Fog("#050505", 20, 45);
    scene.background = new THREE.Color("#111008");
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);
  const handleClick = (e) => {
    switch (e.object.name) {
      case "Window_Books_0":
        setTargetFocus("books");
        break;
      case "frame_gallery":
        setGallery(true);
        break;
      case "frame0":
        if (targetFocus === "frames") {
          setClicked("frame0");
        } else {
          setTargetFocus("frames");
        }
        break;
      case "frame1":
        if (targetFocus === "frames") {
          setClicked("frame1");
        } else {
          setTargetFocus("frames");
        }
        break;
      case "frame2":
        if (targetFocus === "frames") {
          setClicked("frame2");
        } else {
          setTargetFocus("frames");
        }
        break;
      case "frame3":
        if (targetFocus === "frames") {
          setClicked("frame3");
        } else {
          setTargetFocus("frames");
        }
        break;
      default:
        break;
    }
  };
  return (
    <group onClick={handleClick}>
      <CameraControl target={targetFocus} />
      <ambientLight intensity={0.9} color="#ffe8d0" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffd0a0" />
      <pointLight
        position={[-4, 3, 4]}
        intensity={1.5}
        color="#b41c10"
        distance={20}
        decay={2}
      />
      <pointLight
        position={[6, 2, -6]}
        intensity={0.8}
        color="#7a0e08"
        distance={16}
        decay={2}
      />
      <spotLight
        position={[0, 7, 3]}
        intensity={2}
        color="#ffe0b0"
        angle={0.4}
        penumbra={0.6}
        distance={20}
        decay={2}
      />
      <primitive
        rotation={[0, -Math.PI / 2, 0]}
        object={room.scene}
        scale={1}
      />
      <mesh scale={7.5} position={[0, 0, -11]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#080808" />
      </mesh>
      <FrameExperiences
        args={[1, 1, 1]}
        scale={7.1}
        name="frame_gallery"
        position={[0, 0, -10.7]}
        imageUrl={JoelImg}
        label="Gallery"
        onHover={setHovered}
      />
      <FrameExperiences
        text="Research"
        args={[0.1, 2, 2]}
        name="frame1"
        position={[-7.1, 0, 2.5]}
        imageUrl="/3DModels/textures/research_illustration.jpeg"
        label="Research"
        onHover={setHovered}
      />
      <FrameExperiences
        text="Leadership"
        args={[0.1, 2, 2]}
        name="frame2"
        position={[-7.1, 0, 0]}
        imageUrl="/3DModels/textures/leadership_illustration.jpg"
        label="Leadership"
        onHover={setHovered}
      />
      <FrameExperiences
        args={[0.1, 2, 3.55]}
        name="frame0"
        position={[-7.1, 2.5, 0]}
        imageUrl="/3DModels/textures/honors.jpeg"
        label="Honors Program"
        onHover={setHovered}
      />
      <FrameExperiences
        text="Intercultural"
        args={[0.1, 2, 2]}
        name="frame3"
        position={[-7.1, 0, -2.5]}
        imageUrl="/3DModels/textures/intercultural.jpg"
        label="Intercultural Engagement"
        onHover={setHovered}
      />
    </group>
  );
}

// ── AnimatedText ──────────────────────────────────────────────────
function AnimatedText() {
  return null;
}

// ── Modals ────────────────────────────────────────────────────────
function HelpView({ handleClick }) {
  return (
    <div className="honors-overlay">
      <div className="honors-modal">
        <p className="honors-modal__eyebrow">// navigation</p>
        <h2 className="honors-modal__title">
          HOW TO
          <br />
          EXPLORE.
        </h2>
        <hr className="honors-modal__rule" />
        <ul className="honors-modal__list">
          <li>
            <span className="honors-modal__key">Wall frames</span>Click once to
            move camera. Click again to open the section detail.
          </li>
          <li>
            <span className="honors-modal__key">Center portrait</span>Click to
            open the visual Gallery — all photos, documents, and artifacts in
            one place.
          </li>
          <li>
            <span className="honors-modal__key">← Back</span>Returns camera to
            the origin view.
          </li>
          <li>
            <span className="honors-modal__key">Gallery / Artifacts</span>Click
            any card to open fullscreen. Arrow keys to navigate.
          </li>
        </ul>
        <button className="honors-modal__btn" onClick={handleClick}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
function GeneralPopUP({ header, description, click }) {
  return (
    <div className="honors-overlay">
      <div className="honors-modal">
        <p className="honors-modal__eyebrow">// joel tchouke</p>
        <h2 className="honors-modal__title">{header.toUpperCase()}.</h2>
        <hr className="honors-modal__rule" />
        <p className="honors-modal__body">{description}</p>
        <button className="honors-modal__btn" onClick={click}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ── Detail page template ──────────────────────────────────────────
function DetailPage({ title, eyebrow, description, artifactKey, handleClick }) {
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // {title} · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>
      <div className="honors-page__content">
        <p className="honors-page__eyebrow">{eyebrow}</p>
        <h1 className="honors-page__title">{title.toUpperCase()}.</h1>
        <hr className="honors-page__rule" />
        <p className="honors-page__description">{description}</p>
        <p className="honors-page__docs-label">Artifacts</p>
        <ArtifactGallery items={ARTIFACTS[artifactKey]} />
      </div>
    </div>
  );
}

// ── Honors Program page ───────────────────────────────────────────
function HonorsPage({ handleClick }) {
  const imgs = useLazyImages({
    joelT:       () => import("../img/JoelT.png"),
    joelT2:      () => import("../img/JoelT2.jpg"),
    portrait3:   () => import("../img/3.jpg"),
    portrait1409:() => import("../img/IMG_1409.JPG"),
  });
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // Honors Program · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>

      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Portfolio</p>

        <h1 className="honors-page__title">
          HONORS
          <br />
          PROGRAM.
        </h1>

        <hr className="honors-page__rule" />

        <p className="honors-page__description">
          The Honors Program at Minnesota State University, Mankato has challenged me to grow beyond technical coursework by developing my ability to reflect, connect ideas across disciplines, and engage with broader social and cultural perspectives. Through honors courses, writing, and experiential learning, I have strengthened my skills in critical thinking, leadership, and self-awareness.
        </p>

        <SectionBlock
          label="HONR 475 · Capstone Synthesis"
          title="Synthesis Essay"
          text="The HONR 475 capstone synthesis essay represents the culmination of my honors experience. In this work, I reflect on my academic, professional, and personal growth, connecting my experiences in engineering, leadership, and intercultural engagement. The essay highlights how my perspective has evolved over time and how I plan to apply these lessons moving forward."
        >
          <ArtifactGallery items={[ARTIFACTS.honors[2]]} />
        </SectionBlock>

        <SectionBlock
          label="HONR 375 · Interdisciplinary Studies"
          title="Why Honors — Junior Reflection"
          text="In HONR 375, I began to more intentionally connect my technical background in engineering with broader societal and interdisciplinary perspectives. This reflection captures how my understanding of the Honors Program evolved, as I moved from focusing on achievement to focusing on growth, impact, and the ability to think beyond a single discipline."
        >
          <ArtifactGallery items={[ARTIFACTS.honors[1]]} />
        </SectionBlock>

        <SectionBlock
          label="HONR 201 · First Year Experience"
          title="Why Honors — Initial Essay"
          text="This essay was written during my first year in the Honors Program and reflects my initial motivations for joining. At the time, I was focused on academic achievement and personal development. Looking back, this essay provides a clear starting point that allows me to see how my goals, mindset, and understanding of the program have evolved over time."
          photos={[
            lp(imgs.portrait3,    "Campus Portrait"),
            lp(imgs.portrait1409, "Street Portrait"),
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.honors[0]]} />
        </SectionBlock>
      </div>
    </div>
  );
}
// ── Research & Scholarly Activity page ───────────────────────────
function ResearchPage({ handleClick }) {
  const imgs = useLazyImages({
    micro:      () => import("../img/IMG_1214.jpeg"),
    industrial: () => import("../img/IMG_1479.jpeg"),
    ieee755:     () => import("../img/IMG_0755.jpeg"),
    ieee773:     () => import("../img/IMG_0773.jpeg"),
    ieee4537:    () => import("../img/IMG_4537.jpeg"),
    ieee2360:    () => import("../img/IMG_2360.jpeg"),
    ieeeBanner:  () => import("../img/Image (3).jpg"),
    lasVegas:    () => import("../img/IMG_0630.jpeg"),
    ncur:        () => import("../img/image.png"),
    ncurConf:    () => import("../img/Image (42).jpg"),
    seniorDesign:() => import("../img/IMG_0444.JPG"),
  });
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // Research & Scholarly Activity · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>

      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Area</p>

        <h1 className="honors-page__title">
          RESEARCH &<br />
          SCHOLARLY
          <br />
          ACTIVITY.
        </h1>

        <hr className="honors-page__rule" />

        <p className="honors-page__description">
          My research and scholarly work focuses on applying engineering
          concepts to real-world problems. Through hands-on projects, system
          design, and experimentation, I have developed the ability to design,
          test, and refine solutions across embedded systems, control systems,
          and multidisciplinary engineering environments.
        </p>

        <SectionBlock
          label="Power Cell Research"
          title="Embedded Power Optimization Research"
          text="As a research assistant, I worked on improving the power efficiency of a robotic LEGO-based system. I designed and implemented circuitry using the ATtiny85 microcontroller, integrating a rechargeable battery system, battery level monitoring, and low-power sleep functionality. This experience strengthened my understanding of embedded systems, PCB design using KiCad, and energy-efficient system design."
          photos={[ lp(imgs.micro, "Embedded Systems — Breadboard & LCD") ]}
        >
          <ArtifactGallery items={[ARTIFACTS.research[0]]} />
        </SectionBlock>

        <SectionBlock
          label="Senior Capstone"
          title="Poly Exposure Control System Rebuild"
          text="This project involved redesigning and modernizing an industrial control system. My team and I worked on PLC programming, HMI development, electrical panel redesign, and full system integration. I contributed to improving system reliability, usability, and safety while working within real-world engineering constraints, bridging the gap between academic knowledge and applied industry engineering."
          photos={[ lp(imgs.industrial, "Industrial Control System Equipment"),
            lp(imgs.seniorDesign, "Senior Design — Team Photo")
           ]}
        >
          <ArtifactGallery items={[ARTIFACTS.research[1]]} />
        </SectionBlock>

        <SectionBlock
          label="Smart Glasses Project"
          title="Assistive Embedded System Development"
          text="I contributed to the development of an advanced smart glasses system integrating object recognition, text-to-speech, and wireless communication. My work focused on embedded system integration and communication modules. This project required combining hardware, software, and AI-driven components into a cohesive system, strengthening my ability to work on complex multidisciplinary engineering challenges."
        >
          <ArtifactGallery items={[ARTIFACTS.research[2]]} />
        </SectionBlock>

        <SectionBlock
          label="IEEE Rising Stars Conference"
          title="Professional Development & Scholarly Engagement"
          text="Attending the IEEE Rising Stars Conference was a pivotal moment in my research and professional journey. I networked with fellow engineers, attended technical sessions, and represented my institution at a nationally recognized conference for emerging engineering leaders."
          photos={[
            lp(imgs.ieeeBanner, "IEEE Rising Stars — With Banner"),
            lp(imgs.ieee755,    "IEEE Rising Stars — Group Photo"),
            lp(imgs.ieee773,    "IEEE Rising Stars — Award Ceremony"),
            lp(imgs.ieee4537,   "IEEE Rising Stars — Conference"),
            lp(imgs.ieee2360,   "Conference Networking"),
            lp(imgs.lasVegas,   "Las Vegas — Conference City"),
          ]}
        />

        <SectionBlock
          label="NCUR · National Conference on Undergraduate Research"
          title="Undergraduate Research Presentation"
          text="Presenting at NCUR was a defining milestone in my scholarly journey. I had the opportunity to share original research with peers and faculty from institutions across the country, sharpening my ability to communicate technical work to a broad academic audience and affirming my identity as an undergraduate researcher."
          photos={[
              lp(imgs.ncur, "NCUR — Presentation"),
              lp(imgs.ncurConf, "NCUR — Conference"),
          ]}
        />
      </div>
    </div>
  );
}

// ── Leadership page ───────────────────────────────────────────────
function LeadershipPage({ handleClick }) {
  const imgs = useLazyImages({
    nsbe:      () => import("../img/IMG_6921.jpeg"),
    event8706: () => import("../img/IMG_8706.jpeg"),
    event9236: () => import("../img/IMG_9236.jpeg"),
    camFlag6:  () => import("../img/6.jpg"),
    camFlag7:  () => import("../img/7.jpg"),
    stagePerf: () => import("../img/2.JPG"),
    mavPass1:  () => import("../img/Image (43).jpg"),
    mavPass2:  () => import("../img/Image (44).jpg"),
    cybersecurityAssociation: () => import("../img/Roles.png"),
    internationalEvent: () => import("../img/Image (28).jpg"),
  });
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // Leadership · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>

      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Area</p>

        <h1 className="honors-page__title">LEADERSHIP.</h1>

        <hr className="honors-page__rule" />

        <p className="honors-page__description">
          Leadership, to me, is about ownership, responsibility, and impact.
          Through my roles in student organizations, tutoring, and team-based
          engineering projects, I have developed the ability to lead, support
          others, and contribute to environments where people can grow and
          succeed.
        </p>

        <SectionBlock
          label="StrengthsFinder"
          title="CliftonStrengths Assessment"
          text="The CliftonStrengths assessment provided insight into how I approach leadership, problem-solving, and collaboration. Understanding my strengths has helped me recognize how I contribute to teams, how I communicate effectively, and how I continue to grow as both a leader and an engineer."
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[3]]} />
        </SectionBlock>

        <SectionBlock
          label="Technical & Organizational Leadership"
          title="Student Organizations and Leadership Roles"
          text="I have taken on leadership roles across multiple student organizations, including serving as President of the Cybersecurity Association and Vice President roles in other campus organizations. In these positions, I have led teams, organized events, and created opportunities for student engagement while developing my ability to manage responsibilities and lead with accountability."
          photos={[
            lp(imgs.nsbe,      "NSBE Annual Convention 2026"),
            lp(imgs.event8706, "Organization Milestone Event"),
            lp(imgs.event9236, "Professional Conference"),
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[0]]} />
        </SectionBlock>

        <SectionBlock
          label="Instructional Leadership"
          title="MavPASS and Peer Mentorship"
          text="As a MavPASS leader and tutor, I guided students through challenging engineering concepts, helping them build confidence and improve academically. This experience strengthened my communication skills and taught me how to adapt my teaching style to different learning needs, reinforcing leadership through service and mentorship."
          photos={
            [
              lp(imgs.mavPass1, "MavPass team training"),
              lp(imgs.mavPass2, "End of semester MavPass recognition"),
            ]
          }
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[2]]} />
        </SectionBlock>

        <SectionBlock
          label="Community & Cultural Leadership"
          title="International and Cultural Engagement Leadership"
          text="Through my involvement in organizations such as the International Student Association and African Student Association, I contributed to building inclusive communities and supporting students from diverse backgrounds. These experiences helped me develop cross-cultural leadership skills and a deeper understanding of community building."
          photos={[
            lp(imgs.camFlag6,  "Cameroonian Heritage Day"),
            lp(imgs.internationalEvent,  "International Festival parade as the VP of ISA"),
            lp(imgs.stagePerf, "ISA/ASA Stage Performance"),
            lp(imgs.cybersecurityAssociation, "Cybersecurity Association — Role in the CCDC competition"),
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.leadership[1]]} />
        </SectionBlock>
      </div>
    </div>
  );
}

// ── Intercultural Engagement page ────────────────────────────────
function InterculturalPage({ handleClick }) {
  const imgs = useLazyImages({
    cenote:    () => import("../img/1.JPG"),
    tulum4:    () => import("../img/4.jpg"),
    tulum5:    () => import("../img/5.jpg"),
    horseback: () => import("../img/8.JPG"),
    camFlag6:  () => import("../img/6.jpg"),
    internationalEvent:  () => import("../img/Image (28).jpg"),
    stagePerf: () => import("../img/2.JPG"),
  });
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // Intercultural Engagement · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>

      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Competency Area</p>

        <h1 className="honors-page__title">
          INTERCULTURAL
          <br />
          ENGAGEMENT.
        </h1>

        <hr className="honors-page__rule" />

        <p className="honors-page__description">
          My intercultural experiences have shaped how I understand identity,
          communication, and global perspectives. Through leadership roles,
          academic programs, and personal experiences, I have developed the
          ability to navigate and contribute to diverse environments.
        </p>

        <SectionBlock
          label="Study Abroad & Language"
          title="Cultural and Language Experience"
          text="Through my experience in the Intensive English Program, I developed a deeper understanding of the relationship between language and culture. This experience highlighted how communication shapes identity and access, while also exposing the challenges and growth that come with adapting to new cultural environments."
          photos={[
            lp(imgs.cenote,    "Cenote Snorkeling — Mexico"),
            lp(imgs.tulum4,    "Tulum — Mayan Ruins with Friends"),
            lp(imgs.tulum5,    "Mayan Ruins — White Sands"),
            lp(imgs.horseback, "Horseback Riding — Tropical Forest"),
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.intercultural[1]]} />
        </SectionBlock>

        <SectionBlock
          label="Maverick Global Ambassador"
          title="Intercultural Leadership and Representation"
          text="As a Maverick Global Ambassador, I engaged with students from diverse cultural backgrounds and helped create an inclusive environment on campus. This role strengthened my ability to communicate across cultures, reflect on my own identity, and contribute to meaningful intercultural dialogue."
          photos={[
            lp(imgs.camFlag6,  "Cameroonian Heritage Day — Campus Event"),
            lp(imgs.internationalEvent, "International Festival — Cultural Booth"),
            lp(imgs.stagePerf, "ISA/ASA Cultural Stage Performance"),
          ]}
        >
          <ArtifactGallery items={[ARTIFACTS.intercultural[0]]} />
        </SectionBlock>
      </div>
    </div>
  );
}

// ── About Me page ─────────────────────────────────────────────────
function AboutMePage({ handleClick }) {
  const imgs = useLazyImages({
    headshot: () => import("../img/headshot1.JPG"),
    joelT:    () => import("../img/JoelT.png"),
    joelT2:   () => import("../img/JoelT2.jpg"),
    joelT3:   () => import("../img/JoelT3.jpg"),
    guitar:   () => import("../img/about1.jpeg"),
    micro:    () => import("../img/IMG_1214.jpeg"),
    nsbe:     () => import("../img/IMG_6921.jpeg"),
  });
  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // About Me · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>
      <div className="honors-page__content honors-page__content--rich">
        <p className="honors-page__eyebrow">Portfolio Introduction</p>
        <h1 className="honors-page__title">
          ABOUT
          <br />
          ME.
        </h1>
        <hr className="honors-page__rule" />

        <div className="hp-about-grid">
          <div className="hp-about-photo">
            <img
              src={imgs.headshot || ""}
              alt="Joel Tchouke"
              className="hp-about-photo__img"
              loading="lazy"
            />
          </div>

          <div className="hp-stat-row">
            <div className="hp-stat">
              <span className="hp-stat__key">Name</span>
              <span className="hp-stat__val">Joel Tchouke</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">Major</span>
              <span className="hp-stat__val">Computer Engineering</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">Minor</span>
              <span className="hp-stat__val">Physics</span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">University</span>
              <span className="hp-stat__val">
                Minnesota State University, Mankato
              </span>
            </div>
            <div className="hp-stat">
              <span className="hp-stat__key">Programs</span>
              <span className="hp-stat__val">
                Honors Program · IEEE · Cybersecurity Association
              </span>
            </div>
          </div>
        </div>

        <SectionBlock
          label="Who I Am"
          title="Engineer, Builder, and Leader"
          text="I am a Computer Engineering student at Minnesota State University, Mankato, with a minor in Physics and a strong interest in embedded systems, software, cybersecurity, and real-world engineering design. My work has ranged from research and tutoring to SOC analysis, automation, and senior design. I care a lot about building things that are technically solid, useful in practice, and meaningful to the people who use them."
        />

        <SectionBlock
          label="Future Goals"
          title="What I Am Working Toward"
          text="My goal is to build a career in embedded software, systems engineering, and product development, where I can work close to both hardware and software while solving difficult technical problems. I am especially interested in opportunities involving low-level systems, intelligent devices, automation, and infrastructure that has real impact. Long term, I want to grow into an engineer who not only builds strong systems, but also leads teams, mentors others, and creates opportunities for people who come from backgrounds like mine."
        />

        <SectionBlock
          label="Interests and Hobbies"
          title="Beyond Engineering"
          text="Outside of class and technical work, I enjoy music, fitness, leadership, and personal projects. I like building things from scratch, whether that means writing code, designing systems, improving workflows, or creating something more creative. I also value mentorship and community, which is why I have stayed involved in tutoring, student organizations, and leadership roles on campus."
        />

        <SectionBlock
          label="Photo Gallery"
          title="Moments That Represent Me"
          text="This section highlights the people, projects, and experiences that have shaped my college journey — from engineering work and leadership events to personal passions and international travel."
          photos={[
            lp(imgs.joelT,  "Professional Headshot"),
            lp(imgs.joelT2, "Studio Portrait"),
            lp(imgs.joelT3, "Close-Up Portrait"),
            lp(imgs.guitar, "Guitar Performance"),
            lp(imgs.micro,  "Embedded Systems Work"),
            lp(imgs.nsbe,   "NSBE Convention 2026"),
          ]}
        />
      </div>
    </div>
  );
}
// ── Gallery card ─────────────────────────────────────────────────
function GalleryCard({ item, onOpen }) {
  return (
    <div
      className={`gal-card${item.placeholder ? " gal-card--placeholder" : ""}`}
      onClick={item.placeholder ? undefined : onOpen}
    >
      <div className="gal-card__thumb">
        {item.type === "image" && item.thumb ? (
          <img src={item.thumb} alt={item.label} loading="lazy" />
        ) : item.type === "pdf" && !item.placeholder ? (
          <div className="gal-card__icon-thumb">
            <PDFIcon />
            <span className="gal-card__ext">PDF</span>
          </div>
        ) : item.type === "video" && !item.placeholder ? (
          <div className="gal-card__icon-thumb">
            <VideoIcon />
            <span className="gal-card__ext">VIDEO</span>
          </div>
        ) : (
          <div className="gal-card__blank-thumb">
            <span className="gal-card__blank-icon">+</span>
          </div>
        )}
        {!item.placeholder && (
          <div className="gal-card__reveal">
            <span>OPEN</span>
          </div>
        )}
      </div>
      <div className="gal-card__footer">
        <span className="gal-card__label">{item.label}</span>
        <span className={`gal-card__cat gal-card__cat--${item.category}`}>
          {item.category}
        </span>
      </div>
      {item.placeholder && item.note && (
        <div className="gal-card__note">{item.note}</div>
      )}
    </div>
  );
}

// ── Gallery page ──────────────────────────────────────────────────
const GAL_CATS = [
  "all",
  "photos",
  "events",
  "intercultural",
  "documents",
  "certificates",
  "projects",
];

function GalleryPage({ handleClick }) {
  const [activeCat, setActiveCat] = useState("all");
  const [lbItems, setLbItems] = useState(null);
  const [lbStart, setLbStart] = useState(0);
  const [paths, setPaths] = useState({});

  // Lazily resolve all image imports when the Gallery page opens
  useEffect(() => {
    let alive = true;
    GALLERY_ITEMS.forEach((item, i) => {
      if (item.lazy && !item.placeholder) {
        item
          .lazy()
          .then((m) => {
            if (alive) setPaths((p) => ({ ...p, [i]: m.default }));
          })
          .catch(() => {});
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Merge resolved paths back into items
  const items = GALLERY_ITEMS.map((item, i) =>
    item.lazy
      ? { ...item, path: paths[i] ?? null, thumb: paths[i] ?? null }
      : item
  );

  const filtered =
    activeCat === "all"
      ? items
      : items.filter((item) => item.category === activeCat);

  const openItem = (item) => {
    if (item.placeholder || !item.path) return;
    const realItems = filtered.filter((i) => !i.placeholder && i.path);
    setLbItems(realItems);
    setLbStart(Math.max(realItems.indexOf(item), 0));
  };

  const realCount = filtered.filter((i) => !i.placeholder && i.path).length;
  const pendingCount = filtered.filter((i) => i.placeholder || !i.path).length;

  return (
    <div className="honors-page">
      <header className="honors-page__topbar">
        <span className="honors-page__breadcrumb">
          // Gallery · Joel Tchouke
        </span>
        <button className="honors-page__exit-btn" onClick={handleClick}>
          ← SCENE
        </button>
      </header>

      <div className="gal-page">
        <div className="gal-header">
          <p className="gal-eyebrow">Visual Archive</p>
          <h1 className="gal-title">GALLERY.</h1>
          <hr className="gal-rule" />
          <div className="gal-tabs">
            {GAL_CATS.map((cat) => (
              <button
                key={cat}
                className={`gal-tab${activeCat === cat ? " gal-tab--active" : ""}`}
                onClick={() => setActiveCat(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="gal-count">
            {realCount} items · {pendingCount} pending
          </p>
        </div>

        <div className="gal-masonry">
          {filtered.map((item, i) => (
            <GalleryCard
              key={`${item.category}-${i}`}
              item={item}
              onOpen={() => openItem(item)}
            />
          ))}
        </div>
      </div>

      {lbItems && (
        <Lightbox
          items={lbItems}
          startIndex={lbStart}
          onClose={() => setLbItems(null)}
        />
      )}
    </div>
  );
}

// ── Mobile gate ───────────────────────────────────────────────────
function MobileGate({ onNavigate }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: "0.55rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(240,240,240,0.3)",
          marginBottom: "1.4rem",
        }}
      >
        // Joel Tchouke · Honors
      </p>
      <h1
        style={{
          fontFamily: "'Anton','Impact',sans-serif",
          fontSize: "clamp(3rem,12vw,5rem)",
          fontWeight: 900,
          color: "rgba(240,240,240,0.9)",
          margin: "0 0 1.6rem",
          lineHeight: 0.9,
          textTransform: "uppercase",
        }}
      >
        DESKTOP
        <br />
        ONLY.
      </h1>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid rgba(240,240,240,0.08)",
          width: "100%",
          maxWidth: 320,
          margin: "0 0 1.8rem",
        }}
      />
      <p
        style={{
          fontFamily: "'Space Mono',monospace",
          fontSize: "0.78rem",
          lineHeight: 1.8,
          color: "rgba(240,240,240,0.4)",
          maxWidth: 320,
          margin: "0 0 2.4rem",
        }}
      >
        This experience requires a desktop browser.
      </p>
      {onNavigate && (
        <button
          onClick={() => onNavigate("main")}
          style={{
            background: "#b41c10",
            border: "none",
            fontFamily: "'Space Mono',monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(240,240,240,0.95)",
            cursor: "pointer",
            padding: "0.7rem 1.6rem",
          }}
        >
          ← BACK TO MAIN
        </button>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────
function SceneThree({ onNavigate }) {
  const [targetFocus, setTargetFocus] = useState("origin");
  const [helpClick, setHelpClick] = useState(false);
  const [clicked, setClicked] = useState("");
  const [intro, setIntro] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [mission, setMission] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [aboutMe, setAboutMe] = useState(false);
  const [gallery, setGallery] = useState(false);

  useEffect(() => {
    if (targetFocus === "books" && onNavigate) {
      onNavigate("about", { fromHonors: true });
      setTargetFocus("origin");
    }
  }, [targetFocus, onNavigate]);

  useEffect(() => {
    const m = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);

  if (window.innerWidth < 768) return <MobileGate onNavigate={onNavigate} />;
  const close = () => setClicked("");

  return (
    <FrameFocusContext.Provider value={{ targetFocus, setTargetFocus }}>
      <SceneLoader />
      <div className="App scene-root" style={{ background: "#050505" }}>
        <header className="scene-topbar">
          <div className="scene-topbar__left">
            <div className="scene-topbar__logo">TJ</div>
            <span className="scene-topbar__title">HONORS</span>
          </div>
          <nav className="scene-topbar__nav">
            <span className="scene-topbar__bracket">[</span>
            <button
              className="scene-nav-btn"
              onClick={() => setIntro((v) => !v)}
            >
              INTRO
            </button>
            <button
              className="scene-nav-btn"
              onClick={() => setWelcome((v) => !v)}
            >
              WELCOME
            </button>
            <button
              className="scene-nav-btn"
              onClick={() => setMission((v) => !v)}
            >
              MISSION
            </button>
            <button
              className="scene-nav-btn"
              onClick={() => setHelpClick((v) => !v)}
            >
              HELP
            </button>
            <button
              className="scene-nav-btn"
              onClick={() => setAboutMe((v) => !v)}
            >
              ABOUT ME
            </button>
            {onNavigate && (
              <button
                className="scene-nav-btn scene-nav-btn--back"
                onClick={() => onNavigate("main")}
              >
                ← MAIN
              </button>
            )}
            <span className="scene-topbar__bracket">]</span>
          </nav>
        </header>

        {targetFocus !== "origin" && (
          <button
            className="scene-exit-btn"
            onClick={() => setTargetFocus("origin")}
          >
            ← BACK
          </button>
        )}

        {helpClick && <HelpView handleClick={() => setHelpClick((v) => !v)} />}
        {clicked === "frame0" && <HonorsPage handleClick={close} />}
        {clicked === "frame1" && <ResearchPage handleClick={close} />}
        {clicked === "frame2" && <LeadershipPage handleClick={close} />}
        {clicked === "frame3" && <InterculturalPage handleClick={close} />}
        {aboutMe && <AboutMePage handleClick={() => setAboutMe(false)} />}
        {gallery && <GalleryPage handleClick={() => setGallery(false)} />}

        {intro && (
          <GeneralPopUP
            header="Introduction"
            description="Welcome to my honors portfolio. My name is Joel Tchouke, and I am passionate about growing as a leader and using my skills to make a meaningful impact in the world. Through my journey as an honors student, I have worked to combine my knowledge of engineering with a strong desire to serve others and solve real-world problems."
            click={() => setIntro((v) => !v)}
          />
        )}
        {welcome && (
          <GeneralPopUP
            header="Welcome"
            description="Hello and welcome. I'm Joel Tchouke, and this portfolio is a reflection of my journey, growth, and accomplishments. Here you'll find projects, experiences, and insights that showcase my passion for engineering, leadership, and making a positive impact."
            click={() => setWelcome((v) => !v)}
          />
        )}
        {mission && (
          <GeneralPopUP
            header="Mission Statement"
            description="My mission is to use my skills in engineering and leadership to make a strong, positive impact in the environment around me. I am dedicated to solving real-world problems and creating solutions that not only advance technology but also improve the lives of those I work with."
            click={() => setMission((v) => !v)}
          />
        )}

        <Canvas
          dpr={[1, 1.2]}
          performance={{ min: 0.25, max: 0.75 }}
          gl={{ antialias: false, powerPreference: "high-performance", precision: "lowp" }}
        >
          <Suspense fallback={null}>
            <Scene
              setClicked={setClicked}
              setHovered={setHovered}
              setGallery={setGallery}
            />
            <AnimatedText />
          </Suspense>
        </Canvas>

        <div className="scene-hint">
          <span className="scene-hint__line" />
          <span className="scene-hint__text">CLICK FRAMES TO EXPLORE</span>
          <span className="scene-hint__line" />
        </div>

        {hovered && (
          <div
            className="scene-tooltip"
            style={{ left: mousePos.x + 18, top: mousePos.y - 10 }}
          >
            {hovered.toUpperCase()}
          </div>
        )}
      </div>
    </FrameFocusContext.Provider>
  );
}

useGLTF.preload("/3DModels/scene.gltf");
export default SceneThree;
