import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import gsap from 'gsap';
import Preloader from './components/Preloader';
import Main from './components/Main';
import NotFound from './components/NotFound';
const ScenesThree = lazy(() => import('./components/ScenesThree'));

function AppInner({ done }) {
  const curtainRef = useRef(null);
  const dotRef     = useRef(null);
  const ringRef    = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    const moveX = gsap.quickTo(dot,  'x', { duration: 0.08, ease: 'power3' });
    const moveY = gsap.quickTo(dot,  'y', { duration: 0.08, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power3' });
    const onMove = (e) => {
      moveX(e.clientX); moveY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const navigate = (dest) => {
    const curtain = curtainRef.current;
    const path = dest === 'main' ? '/' : `/${dest}`;
    gsap.timeline()
      .fromTo(curtain,
        { scaleY: 0, transformOrigin: 'bottom' },
        { scaleY: 1, duration: 0.42, ease: 'power3.inOut' }
      )
      .add(() => nav(path))
      .to(curtain, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.42,
        ease: 'power3.inOut',
        delay: 0.06,
      });
  };

  return (
    <>
      <div className="cursor"     ref={dotRef}  />
      <div className="cursorRing" ref={ringRef} />
      <Routes>
        <Route path="/" element={<Main onNavigate={navigate} />} />
        <Route path="/honors" element={
          <Suspense fallback={null}>
            <ScenesThree onNavigate={navigate} />
          </Suspense>
        } />
        <Route path="*" element={<NotFound onNavigate={navigate} />} />
      </Routes>
      <div ref={curtainRef} style={{
        position: 'fixed', inset: 0,
        background: '#050505',
        transform: 'scaleY(0)',
        transformOrigin: 'bottom',
        zIndex: 9500,
        pointerEvents: 'none',
      }} />
    </>
  );
}

function App() {
  const [done, setDone] = useState(false);

  return (
    <BrowserRouter>
      {!done && <Preloader onComplete={() => setDone(true)} />}
      <AppInner done={done} />
    </BrowserRouter>
  );
}

export default App;
