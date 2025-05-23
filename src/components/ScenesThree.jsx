import { createContext, useContext, useEffect, useRef, useState } from 'react';
import '../App.css';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Html } from '@react-three/drei';

import '../css/honorScene.css'
import { useSpring, animated } from '@react-spring/three'; // Import animated from react-spring
import "../css/aboutme.css"
import JoelImg from "../img/joelG.PNG"
import About from './About';
import * as THREE from 'three';

//pdf
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { bleach } from 'three/webgpu';
import finder from "../img/finder.png"

const FrameFocusContext = createContext();
let clicked = ""

const PDFReader = ({ path, name }) => {
  const [pdfLoaded, setPdfLoaded] = useState(false); // Track whether the PDF is loaded
  const pdfFilePath = path; // Path to the PDF file
  const defaultLayout = defaultLayoutPlugin();

  return (
      !pdfLoaded ? (
        <button
          onClick={() => setPdfLoaded(true)}
          className="why-honors-btn"
          style={{zIndex:6000}}
        >
          {name}
        </button>
      ) : (
        <div
          style={{
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '8px',
            background:"black",
            width: '100%',
            margin: '20px auto',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer fileUrl={pdfFilePath} plugins={[defaultLayout]} />
          </Worker>
        </div>
      )
  );
};

function CameraControl({ target }) {
  const { camera } = useThree();
  const controls = useRef();

  //Targeted position
  const targetPositionOrigin =  new THREE.Vector3(0, 0, 8)
  const targetPositionFrames =  new THREE.Vector3(-1, 0, 0)
  const targetPositionBooks = new THREE.Vector3(-2, -1, 5)

  //Targeted lookat point
  const targetLookAtOrigin = new THREE.Vector3(0, 0, 0);  
  const targetLookAtFrames = new THREE.Vector3(-5, 0, 0)
  const targetLookAtBooks = targetLookAtOrigin

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));


 let targetPosition = targetPositionOrigin
 let targetLookAt = targetLookAtOrigin
 if(target === "frames"){
    targetPosition = targetPositionFrames
    targetLookAt = targetLookAtFrames
 }else if(target === "books"){
    targetPosition = targetPositionBooks
    targetLookAt = targetLookAtBooks
 }

  // Smoothly interpolate the camera's position
  useFrame(() => {
    //if(lerp)
    {
      camera.position.lerp(targetPosition, 0.05); // Adjust 0.05 for the speed of movement
      currentLookAt.current.lerp(targetLookAt, 0.05); // Adjust 0.05 for smoothness of lookAt transition
      camera.lookAt(currentLookAt.current);}
  });

  return (
    <>
      <OrbitControls ref={controls} enableZoom={false} />
    </>
  );
}

function FrameExperiences({ position, scale, imageUrl, name, args, text, action }) {
  // Load the texture for the picture
  const textRef = useRef();
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const [textVisible, setTextVisible] = useState(0);
  const { targetFocus, setTargetFocus } = useContext(FrameFocusContext);
  const [clickedFrame, setClickedFrame] = useState('');

  useEffect(() => {
    textRef.current.rotation.y = Math.PI / 2;
  }, []);

  useEffect(() => {
    targetFocus === 'frames' ? setTextVisible(1) : setTextVisible(0);
  }, [targetFocus]);

  const handleClick = (e) => {
    if (targetFocus === 'frames') {
      // Handle frame click (if needed)
    }
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'; // Change cursor on hover
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'; // Reset cursor when hover ends
  };

  return (
    <mesh
      onClick={handleClick}
      name={name}
      scale={scale}
      position={position}
      onPointerOver={handlePointerOver}  // Change cursor when hovering
      onPointerOut={handlePointerOut}    // Reset cursor when not hovering
    >
      <boxGeometry args={args} />
      <meshStandardMaterial attachArray="material" map={texture} />
      <Text
        ref={textRef}
        position={[0, -1.5, 0]}
        scale={0.4}
        color={'black'}
        fillOpacity={textVisible}
      >
        {text}
      </Text>
    </mesh>
  );
}

function Scene({showpdff, setShowpdff}) {
  const room = useGLTF("/3DModels/scene.gltf");
  const sceneRef = useRef();
  const {targetFocus, setTargetFocus} = useContext(FrameFocusContext)
  console.log(targetFocus)
  const [showpdf, setshowpdf] = useState()

  const handleClick = (event) => {
   switch (event.object.name) {
    case "Window_Books_0":
      setTargetFocus("books")
      break;
    case "frame0":
      if(targetFocus == "frames"){ 
        clicked = event.object.name
      } 
      setTargetFocus("frames")
      break;
    case "frame1" :
      if(targetFocus == "frames"){ 
        clicked = event.object.name
      } 
      setTargetFocus("frames")
      break;
    case "frame2" : 
    if(targetFocus == "frames"){ 
      clicked = event.object.name
    } 
      setTargetFocus("frames")
      break;
    case "frame3" : 
      if(targetFocus == "frames"){ 
        clicked = event.object.name
      } 
      setTargetFocus("frames")
      break;
    default:
      break;
   }
    
  };


  // This function will recursively traverse the scene and log each element
  const logSceneElements = () => {
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        // Log properties of each object, like its name and position
        console.log('Object:', object);
        console.log('Name:', object.name);
        console.log('Position:', object.position);
        console.log('Type:', object.type);
      });
    }
  };

  // Use useEffect to trigger logging once the scene has been rendered
  useEffect(() => {
    logSceneElements();
  }, [room]);

  return (
    <group ref={sceneRef} onClick={handleClick}>
      <CameraControl target={targetFocus} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <mesh>
        <primitive rotation={[0, -Math.PI / 2, 0]} object={room.scene} scale={1} />
      </mesh>
        <mesh scale={7.5} position={[0,0,-11]}>
          <boxGeometry args={[1,1,1]}   />
          <meshStandardMaterial color={"black"} />
        </mesh>
        <FrameExperiences action="Action" args={[1,1,1]} scale={7.1} name='frame1' position={[0,0,-10.7]} imageUrl={JoelImg} click={"none"}/>
        <FrameExperiences action={'ffrfr'} text={"𝑅𝑒𝓈𝑒𝒶𝓇𝒸𝒽"} args={[0.1,2,2]} name='frame1' position={[-7.1,0,2.5]} imageUrl={"/3DModels/textures/research_illustration.jpeg"} click={handleClick} />
        <FrameExperiences text={"𝑳𝒆𝒂𝒅𝒆𝒓𝒔𝒉𝒊𝒑"} args={[0.1,2,2]} name='frame2' position={[-7.1,0,0]} imageUrl={"/3DModels/textures/leadership_illustration.jpg"} click={handleClick} />
        <FrameExperiences args={[0.1,2,3.55]} name='frame0' position={[-7.1,2.5,0]} imageUrl={"/3DModels/textures/honors.jpeg"} click={handleClick} />
        <FrameExperiences text={"Ìñ†êr¢µl†µrål"} args={[0.1,2,2]} name='frame3' position={[-7.1,0,-2.5]} imageUrl={"/3DModels/textures/intercultural.jpg"} click={handleClick} />
    </group>
  );
}

function AnimatedText() {
  const [spring, api] = useSpring(() => ({
    positionY: -3, // Initial Y position
    scale: 0.5,    // Start small
    opacity: 0,    // Start invisible
    config: { mass: 1, tension: 180, friction: 16 }, // Spring configuration
  }));

  useEffect(() => {
    // Animate in sequence
    (async () => {
      await api.start({ positionY: 1, scale: 1.5, opacity: 1 }); // Move to 0, grow, and fade in
      await new Promise(resolve => setTimeout(resolve, 3000));    // Pause for 5 seconds
      await api.start({ positionY: 10, opacity: 0 }); // Move up, shrink, and fade out
    })();
  }, [api]);

  return (
    <animated.group position-y={spring.positionY} scale={spring.scale}>
      <animated.mesh>
        <Text
          fontSize={5.5}
          color="brown"
          opacity={spring.opacity} // Control opacity
          position={[0,-0.5,-3]}
        >
          𝔍𝔬𝔢𝔩
        </Text>
      </animated.mesh>
    </animated.group>
  );
}
function HelpView({handleClick}){
  return(
    <div className="help-modal" style={{
      position: "absolute",
      background: "rgba(0, 0, 0, 0.8)",
      color: "white",
      minWidth: "300px",
      minHeight: "400px",
      top: "30px",
      left: "30px",
      right: "30px",
      bottom: "30px",
      zIndex: 10,
      padding: "20px",
      borderRadius: "10px",
    }}>
            <div className="help-content">
                <h2>Website Navigation Help</h2>
                <p>Welcome! Here’s how you can navigate through this website:</p>
                <ul>
                    <li>
                        <strong>General Movement:</strong> Use your mouse to click and drag the 3D space or scroll to zoom in/out.
                    </li>
                    <li>
                        <strong>Frame Interaction:</strong> <br />
                        - Click on any frame to bring it into focus. <br />
                        - Focus on specific frames like "Research," "Leadership," or "Intercultural" for more details.
                    </li>
                    <li>
                        <strong>Viewing PDFs:</strong> <br />
                        - Click on the relevant frame or button to open a PDF. <br />
                        - Use the green "Load PDF" button to display the document and the red "Exit" button to close it.
                    </li>
                    <li>
                        <strong>Scene Exploration:</strong> 
                        - Click on objects to see detailed information.<br />
                        - Move the camera to view different angles of the room.
                    </li>
                    <li>
                        <strong>Go to about Me:</strong> <br />
                        - Click on the book on the table to go to the About me page<br />
                        - Click exit to come back to the main page
                    </li>
                    <li>
                        <strong>Go to Honors pages:</strong> <br />
                        - Click on the frames on the wall to access Honor's pages<br />
                        - Click exit to come back to the main page
                    </li>
                </ul>
                <button onClick={handleClick} className="close-button">Got It!</button>
            </div>
        </div>
    
  )
}
function SceneThree() {
  const [targetFocus, setTargetFocus] = useState("origin")
  const [textY , setTextY] = useState(-4);
  const [showAboutMe, setShowAboutMe] = useState(false); // State to control delayed rendering
  const [helpClick, setHelpClick] = useState(false)
  const [showPdf, setShowPdf] = useState("")
  const [intro, setIntro] = useState(false)
  const [welcome, setWelcome] = useState(false)
  const [mission, setMission] = useState(false)
  const handleIntro = ()=>{
    setIntro(!intro)
  }
  const handleWelcome = ()=>{
    setWelcome(!welcome)
  } 
  const handleMission = ()=>{
    setMission(!mission)
  }

  const handleClickHelp = ()=>{
    setHelpClick(!helpClick)
  }

  useEffect(() => {
    let timer;
    if (targetFocus === "books") {
      // Delay showing AboutMe by 3 seconds
      timer = setTimeout(() => {
        setShowAboutMe(true);
      }, 1100);
    } else {
      setShowAboutMe(false);
    }

    return () => clearTimeout(timer);
  }, [targetFocus]);

  useEffect(()=>{
    setTimeout(() => {
      setTextY(textY + 1)
    }, 1000);
  })

  const handleExit = ()=>{
    setTargetFocus("origin")
  }
  const handlePdf = ()=>{
    setShowPdf(!showPdf)
    clicked = ""
  }
  let pdfTemp = ""
  const [loader, setLoader] = useState(true)
  useEffect(()=>{
    setTimeout(() => {
      setLoader(false)
    }, 1000);
  })

  return (
    <FrameFocusContext.Provider value={{targetFocus, setTargetFocus}}>

    <div className='App'>
    {loader && <div style={{position:"absolute", top:0, bottom:0, right:0, left:0, zIndex:200, background:"white"}} ></div>}
    <div style={{position:'absolute' , top:0, left:'10px', zIndex:2}}>
        <h1>𝕁𝕠𝕖𝕝 𝕋𝕔𝕙𝕠𝕦𝕜𝕖©</h1>
      </div>
      <div style={{position:'absolute' , top:"10px", right:'10px', zIndex:2}}>
        <button className='buttonS' style={{marginRight:"10px", borderRadius:"40px", padding: "10px"}} onClick={handleIntro}>Introduction</button>
        <button className='buttonS' style={{marginRight:"10px", borderRadius:"40px", padding: "10px"}} onClick={handleWelcome}>Welcome Statement</button>
        <button className='buttonS' style={{marginRight:"10px", borderRadius:"40px", padding: "10px"}} onClick={handleMission}>Personal Mission</button>
        <button className='buttonS' style={{borderRadius:"40px", padding: "10px"}} onClick={handleClickHelp}>Navigation Help</button>
      </div>
      <button  className="buttonS" onClick={handleExit} style={{position:'absolute', display : (targetFocus!=="origin") && (targetFocus!=="books") ? "block" : "none" , top:"25px", left:'10px', zIndex:2}}>Exit</button>
        {helpClick && <HelpView handleClick={handleClickHelp} />}
        {showAboutMe && <About context={FrameFocusContext} />}
        {clicked === "frame0" && <div style={{position:"absolute", minHeight:"100vh", top:0, bottom:0, right:0, left:0, zIndex:6000}}><Honors handleClick={handlePdf}  path={"/Experiences/Intercultural/Intercultural.pdf"} /></div>}
        {clicked === "frame1" && <div style={{position:"absolute", minHeight:"100vh", top:0, bottom:0, right:0, left:0, zIndex:6000}}><Research handleClick={handlePdf}  path={"/Experiences/Intercultural/Intercultural.pdf"} /></div>}
        {clicked === "frame2" && <div style={{position:"absolute", minHeight:"100vh", top:0, bottom:0, right:0, left:0, zIndex:6000}}><Leadership handleClick={handlePdf}  path={"/Experiences/Intercultural/Intercultural.pdf"} /></div>}
        {clicked === "frame3" && <div style={{position:"absolute", minHeight:"100vh", top:0, bottom:0, right:0, left:0, zIndex:6000}}><Intercultural handleClick={handlePdf}  path={"/Experiences/Intercultural/Intercultural.pdf"} /></div>}
        
        {intro && <div style={{position:"absolute", top: 0, bottom: 0, right: 0,left: "180px", background:"transparent"}}>
          <GeneralPopUP header={"Introduction"} description={"Welcome to my honors portfolio! My name is Joel Tchouke, and I am passionate about growing as a leader and using my skills to make a meaningful impact in the world. Through my journey as an honors student, I have worked to combine my knowledge of engineering with a strong desire to serve others and solve real-world problems. \n I believe that leadership is about inspiring and empowering people to reach their full potential, and I strive to grow in this area every day. Whether it’s through collaborating on innovative projects, mentoring my peers, or taking on leadership roles in my community, I am committed to making a difference.\n This portfolio showcases my achievements, experiences, and the lessons I’ve learned along the way. It reflects my dedication to excellence and my vision of using both engineering and leadership to create a brighter future. Thank you for taking the time to explore my journey!"} click={handleIntro} />
        </div>}
        {welcome && <div style={{position:"absolute", top: 0, bottom: 0, right: 0,left: "180px", background:"transparent"}}>
          <GeneralPopUP header={"Welcome to my Portfolio"} description={"Hello and welcome! I'm Joel Tchouke, and this portfolio is a reflection of my journey, growth, and accomplishments. Here, you'll find projects, experiences, and insights that showcase my passion for engineering, leadership, and making a positive impact in the world. Thank you for taking the time to explore my work. I hope it inspires you as much as the journey has inspired me!"} click={handleWelcome} />
        </div>}
        {mission && <div style={{position:"absolute", top: 0, bottom: 0, right: 0,left: "180px", background:"transparent"}}>
          <GeneralPopUP header={"Mission Statement"} description={"My mission is to use my skills in engineering and leadership to make a strong, positive impact in the environment around me. I am dedicated to solving real-world problems and creating solutions that not only advance technology but also improve the lives of those I work with. Through my studies and experiences, I strive to inspire others, empower my community, and contribute to a brighter future for all."} click={handleMission} />
        </div>}
      <Canvas>
        <mesh>
          <Scene showpdff={showPdf} />
          <AnimatedText />
        </mesh>
      </Canvas>
    </div>
    </FrameFocusContext.Provider>

  );
}











function GeneralPopUP({header, description, click}){
  return(
    <div style={{zIndex:40000, position:"absolute", top:"10px", bottom:"10px", right:"10px", left:"10px", display:"flex", justifyContent:"center", alignItems:"center"}}>
    <div class="" id="popupOverlay">
  <div class="popup">
    <div class="popup-header">
      <h2 class="popup-title">{header}</h2>
      <button class="close-btn" onClick={click}>×</button>
    </div>
    <div class="popup-body">
      <p>{description}</p>
      <br />
      <button class="cta-btn" onClick={click}>Close</button>
    </div>
  </div>
</div>


    </div>
  )
}
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Adjust canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const totalParticles = 200; // Adjust for density

    // Particle constructor
    class Particle {
      constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < totalParticles; i++) {
      const size = 1;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = (Math.random() - 0.5) * 0.5;
      const speedY = (Math.random() - 0.5) * 0.5;
      particles.push(new Particle(x, y, size, speedX, speedY));
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Resize canvas on window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-background"></canvas>;
};


function Honors({ path, handleClick }) {
  const [backgroundExpanded, setBackgroundExpanded] = useState(false); // Track background expansion state

  const handleLoadPDF = () => {
    setBackgroundExpanded(true); // Expand the background when the PDF is loaded
  };

  return (
    <div
      className="honors-container aboutme_content"
      style={{
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        position: 'relative',
        transition: 'background 0.5s ease', // Smooth transition for background expansion
        backgroundColor: backgroundExpanded ? 'rgba(0, 0, 0, 0.7)' : 'transparent', // Change background color/size
        padding: backgroundExpanded ? '50px' : '20px', // Adjust padding to simulate expansion
      }}
    >
      <div style={{ zIndex: -1 }}>
        <ParticleBackground />
      </div>

      <button
        className="buttonS"
        onClick={handleClick}
        style={{
          background: 'white',
          position: 'absolute',
          left: '10px',
          top: '20px',
          color: 'black',
        }}
      >
        Exit
      </button>

      <section className="honors-section">
        <h1 className="honors-title" style={{ fontSize: '70px', color: 'white' }}>
          Honors Program
        </h1>
        <br />
        <p className="honors-description" style={{ fontSize: '15px' }}>
          Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. The program provides class experiences designed to support competency development and a variety of co-curricular activities to enrich their growth. Students demonstrate their emerging competencies through electronic portfolios in which they document their activities and engage in meaningful reflection about their learning. The Honors Program challenges students to move outside of their comfort zones and think critically about the world and their personal contributions to the communities in which they live.
        </p>
      </section>

      <section className="why-honors-section">
        <h2 className="why-honors-title" style={{ fontSize: '40px', color: 'white' }}>
          Why Honors?
        </h2>
        <div className="why-honors-buttons">
          <PDFReader
            style={{ width: '100%' }}
            path="/Experiences/honors375.pdf"
            name="Load Why Honors 201"
            onClick={handleLoadPDF} // Trigger background expansion when clicked
          />
          <PDFReader
            path="/Experiences/honors375.pdf"
            name="Load Why Honors 375"
            onClick={handleLoadPDF} // Trigger background expansion when clicked
          />
        </div>

        <div className="why-honors-content" id="whyHonorsContent">
          <p>Click a button to learn more about the benefits of the Honors Program.</p>
        </div>
      </section>
    </div>
  );
}


function Research({ path, handleClick }) {
  const [backgroundExpanded, setBackgroundExpanded] = useState(false); // Track background expansion state

  const handleLoadPDF = () => {
    setBackgroundExpanded(true); // Expand background when the PDF is loaded
  };

  return (
    <div
      className="honors-container aboutme_content"
      style={{
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        position: 'relative',
        transition: 'background 0.5s ease', // Smooth transition for background expansion
        backgroundColor: backgroundExpanded ? 'rgba(0, 0, 0, 0.7)' : 'transparent', // Change background color/size
        padding: backgroundExpanded ? '50px' : '20px', // Adjust padding to simulate expansion
      }}
    >
      <div style={{ zIndex: -1 }}>
        <ParticleBackground />
      </div>

      <button
        className="buttonS"
        onClick={handleClick}
        style={{
          background: 'white',
          position: 'fixed',
          left: '10px',
          top: '10px',
          color: 'black',
        }}
      >
        Exit
      </button>

      <section className="honors-section">
        <h1 className="honors-title" style={{ fontSize: '70px', color: 'white' }}>
          Research Competency
        </h1>
        <br />
        <p className="honors-description" style={{ fontSize: '15px' }}>
          Honors students are committed to developing in several competency areas such as leadership, research, and intercultural engagement. The program provides class experiences designed to support competency development and a variety of co-curricular activities to enrich their growth. Students demonstrate their emerging competencies through electronic portfolios in which they document their activities and engage in meaningful reflection about their learning. The Honors Program challenges students to move outside of their comfort zones and to think critically about the world and their personal contributions to the communities in which they live.
        </p>
      </section>

      <section className="why-honors-section">
        <h2 className="why-honors-title" style={{ fontSize: '40px', color: 'white' }}>
          Read my experiences
        </h2>
        <div className="why-honors-buttons">
          <PDFReader
            style={{ width: '100%' }}
            path="/Experiences/Research/Research.pdf"
            name="Load Research Reflection"
            onClick={handleLoadPDF} // Trigger background expansion when the PDF is loaded
          />
        </div>
        <div className="why-honors-content" id="whyHonorsContent">
          <p>Click a button to learn more about my research reflection.</p>
        </div>
      </section>
    </div>
  );
}

function Leadership({ path, handleClick }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [backgroundExpanded, setBackgroundExpanded] = useState(false); // Track background expansion state

  const handleLoadImage = () => {
    setImageLoaded(true);
    setBackgroundExpanded(true); // Expand background when the image is loaded
  };

  return (
    <div
      className="honors-container aboutme_content"
      style={{
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        position: 'relative',
        transition: 'background 0.5s ease', // Smooth transition for background expansion
        backgroundColor: backgroundExpanded ? 'rgba(0, 0, 0, 0.7)' : 'transparent', // Change background color/size
        padding: backgroundExpanded ? '50px' : '20px', // Adjust padding to simulate expansion
      }}
    >
      <div style={{ zIndex: -1 }}>
        <ParticleBackground />
      </div>
      
      <button
        className="buttonS"
        onClick={handleClick}
        style={{
          background: 'white',
          position: 'fixed',
          left: '10px',
          top: '10px',
          color: 'black',
        }}
      >
        Exit
      </button>

      <section className="honors-section">
        <h1 className="honors-title" style={{ fontSize: '70px', color: 'white' }}>
          Leadership
        </h1>
        <br />
        <p className="honors-description" style={{ fontSize: '15px' }}>
          As a leader, I am committed to inspiring and empowering others to achieve their full potential. Through various leadership roles, including my involvement in student organizations and team-based projects, I have developed strong skills in guiding teams, fostering collaboration, and promoting positive change. I believe effective leadership involves active listening, clear communication, and creating an environment where everyone feels valued. Whether it's mentoring peers, leading group projects, or taking initiative in community activities, I strive to lead by example and encourage others to contribute their unique strengths. I am continually focused on improving my leadership skills to make a positive impact in both my academic and professional environments.
        </p>
      </section>

      <section className="why-honors-section">
        <h2 className="why-honors-title" style={{ fontSize: '40px', color: 'white' }}>
          Read my experiences
        </h2>
        <div className="why-honors-buttons">
          <PDFReader style={{ width: '100%' }} path="/Experiences/Leadership/Leadership2.pdf" name="Load Experience leader" />
          <PDFReader style={{ width: '100%' }} path="/Experiences/Leadership/Leadership.pdf" name="Load Experience ISA/ASA" />
          <button
            className="why-honors-btn"
            onClick={handleLoadImage}
          >
            Load Strength Finder Report
          </button>

          {imageLoaded && (
            <div style={{ marginTop: '20px' }}>
              <img
                src={finder} // Replace with your image URL
                alt="Loaded"
                style={{ width: '400px', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          )}
        </div>
        <div className="why-honors-content" id="whyHonorsContent">
          <p>Click a button to learn more about my leadership reflection</p>
        </div>
      </section>
    </div>
  );
}
function Intercultural({ path, handleClick }) {
  const [backgroundExpanded, setBackgroundExpanded] = useState(false); // Track background state

  // Handle click to expand background
  const handleLoadPDF = () => {
    setBackgroundExpanded(true); // Expanding the background when PDF is loaded
  };

  return (
    <div
      className="honors-container aboutme_content"
      style={{
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        position: 'relative',
        transition: 'background 0.5s ease', // Smooth transition for background change
        backgroundColor: backgroundExpanded ? 'rgba(0, 0, 0, 0.7)' : 'transparent', // Adjust the background color/size
      }}
    >
      <div style={{ zIndex: -1 }}>
        <ParticleBackground />
      </div>

      <button
        className="buttonS"
        onClick={handleClick}
        style={{
          background: 'white',
          position: 'fixed',
          left: '10px',
          top: '10px',
          color: 'black',
        }}
      >
        Exit
      </button>

      <section className="honors-section">
        <h1 className="honors-title" style={{ fontSize: '70px', color: 'white' }}>
          Intercultural Engagement
        </h1>
        <br />
        <p className="honors-description" style={{ fontSize: '15px' }}>
          I believe that engaging with diverse cultures enriches my personal growth and enhances my ability to work in global, multicultural environments. Throughout my academic and extracurricular activities, I have actively sought opportunities to interact with people from different cultural backgrounds. Whether through my involvement in international student organizations or my study abroad experiences, I have gained a deeper understanding of cultural differences, developed empathy, and improved my ability to communicate across cultural boundaries. I am dedicated to fostering inclusivity and promoting intercultural dialogue, which I believe are essential for creating a collaborative and harmonious environment. My commitment to intercultural engagement strengthens my leadership and interpersonal skills, preparing me to contribute to a more interconnected world.
        </p>
      </section>

      <section className="why-honors-section">
        <h2 className="why-honors-title" style={{ fontSize: '40px', color: 'white' }}>
          Read my reflection
        </h2>
        <div className="why-honors-buttons">
          {/* Update the button to handle the PDF load */}
          <PDFReader
            style={{ width: '100%' }}
            path="/Experiences/Intercultural/Intercultural.pdf"
            name="Load Intercultural Engagement Reflection"
            onClick={handleLoadPDF} // Add onClick event
          />
        </div>
        <div className="why-honors-content" id="whyHonorsContent">
          <p>Click a button to learn more about my intercultural engagement reflection.</p>
        </div>
      </section>
    </div>
  );
}
export default SceneThree;
