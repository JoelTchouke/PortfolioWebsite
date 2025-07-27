import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { ShaderMateria, Color } from "three/tsl";
import "../css/projects.css";
import * as THREE from "three";

function FashionSphere() {
  return (
    <mesh position={[0, 1, 0]}>
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="hotpink"
          speed={2} // Speed of the wave movement
          distort={0.5} // Intensity of distortion
          roughness={0.3}
          metalness={0.7}
        />
      </Sphere>
    </mesh>
  );
}

function IndProject({ position, rotation }) {
  return (
    <mesh rotation={rotation} position={position}>
      <boxGeometry args={[0.1, 1, 1.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

let projs = [1, 2, 3, 4, 5, 6];

function calculatePosition(angularPosition, radius) {
  const radians = (angularPosition * Math.PI) / 180;
  const x = radius * Math.cos(radians);
  const y = radius * Math.sin(radians);
  const z = 0.1 * (Math.cos(radians) * Math.sin(radians)) + 1;

  const rotation = 360 - 180 - angularPosition;
  const rotationRad = (rotation * Math.PI) / 180;

  return [
    [x, 1, y],
    [0, rotationRad, 0],
  ];
}

function Projects() {
  const [positions, setPositions] = useState(
    projs.map((i, index) => (360 / projs.length) * index)
  );

  useEffect(() => {
    // Function to update the positions dynamically
    const updatedPositions = positions.map((pos, index) => {
      return pos + 0.001;
    }, []);
    setPositions(updatedPositions);
  }, [positions]);
  return (
    <div
      style={{
        background: "black",
        color: "white",
        padding: "10px",
        minHeight: "100vh",
        overflowY: "hidden",
      }}
    >
      <h1>Joel Tchouke</h1>
      <div className="search_proj">
        <input type="text" placeholder="Search the experience" />
        <select name="" id="">
          <option value="">Select category of project</option>
          <option value="Embedded/Firmware">Embedded/Firmware</option>
          <option value="Software">Software</option>
          <option value="Cybersecurity">Cybersecurity</option>
        </select>
        <button>Search</button>
      </div>
      <Canvas camera={{ position: [0, 2.2, 4], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <gridHelper args={[25, 25]} />
        <FashionSphere />
        {positions.length > 0 &&
          projs.map((proj, index) => (
            <IndProject
              key={index}
              position={calculatePosition(positions[index], 3)[0]}
              rotation={calculatePosition(positions[index], 3)[1]}
            />
          ))}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
export default Projects;
