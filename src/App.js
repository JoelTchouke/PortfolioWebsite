import { createContext, useContext, useEffect, useRef, useState, Suspense, lazy } from 'react';
import './App.css';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Html } from '@react-three/drei';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import './css/honorScene.css'
import { useSpring, animated } from '@react-spring/three'; // Import animated from react-spring
import "./css/aboutme.css"
import JoelImg from "./img/JoelT.png"
import * as THREE from 'three';

//pdf
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import Terminal from "./components/Terminal"
import Preloader from './components/Preloader';
import Projects from './components/Projects';
const SceneThree = lazy(()=> import('./components/ScenesThree'))
function App(){
  const [loadScene, setLoadScene] = useState(false)
  const handle =()=>{
    setLoadScene(true)
  }
 
  return( 
    <>
    {/*{!loadScene && <Terminal handle={handle} />}
    <Suspense fallback={<Preloader />}>
        {loadScene && <Projects />}
    </Suspense> */ }
    <Projects />
    </>
  )
}

export default App