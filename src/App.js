import { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import gsap from 'gsap';
import Preloader from './components/Preloader';
import Main from './components/Main';
import Terminal from './components/Terminal';
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

  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      const dest = path === '/' ? 'main'
                : path === '/about' ? 'about'
                : path === '/projects' ? 'projects'
                : path === '/resume' ? 'resume'
                : path === '/contact' ? 'contact'
                : path === '/terminal' ? 'terminal'
                : null;
      const state = window.history.state || {};
      const fromHonorsState = !!state.fromHonors;
      const fromHonorsQuery = window.location.search.includes('from=honors');
      const fromHonors = fromHonorsState || fromHonorsQuery;
      if (dest) navigate(dest, { isPop: true, fromHonors });
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // enhance navigate to accept options (isPop or object) and carry fromHonors state
  const navigate = (dest, opts = {}) => {
    let isPop = false;
    let fromHonors = false;
    if (typeof opts === 'boolean') {
      isPop = opts;
    } else if (opts && typeof opts === 'object') {
      isPop = !!opts.isPop;
      fromHonors = !!opts.fromHonors;
    }

    // if coming from honors we append query param so we don't rely on context
    let path = dest === 'main' ? '/' : `/${dest}`;
    if (fromHonors && dest === 'about') {
      path += '?from=honors';
    }

    const curtain = curtainRef.current;
    const isSectionNav = dest === 'about' || dest === 'projects' || dest === 'resume' || dest === 'main' || dest === 'contact';
    
    // Check if we're currently on a route where Main is mounted
    const currentPath = window.location.pathname;
    const isOnMainRoute = currentPath === '/' || currentPath === '/about' || currentPath === '/resume' || currentPath === '/projects' || currentPath === '/contact';

    gsap.timeline()
      .fromTo(curtain,
        { scaleY: 0, transformOrigin: 'bottom' },
        { scaleY: 1, duration: 0.42, ease: 'power3.inOut' }
      )
      .add(() => {
            if (isSectionNav) {
          if (isOnMainRoute) {
            // Main is mounted; use sectionJump for smooth internal navigation
            if (!isPop) window.history.pushState({ fromHonors }, '', path);
            window.dispatchEvent(new CustomEvent('sectionJump', { detail: dest }));
          } else {
            // Main not mounted; navigate via router
            nav(path);
          }
        } else {
          nav(path);
        }
      })
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
        <Route path="/about"    element={<Main onNavigate={navigate} initialSection={1} />} />
        <Route path="/resume"   element={<Main onNavigate={navigate} initialSection={2} />} />
        <Route path="/projects" element={<Main onNavigate={navigate} initialSection={3} />} />
        <Route path="/contact"  element={<Main onNavigate={navigate} initialSection={4} />} />
        <Route path="/terminal" element={<Terminal onNavigate={navigate} />} />
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
