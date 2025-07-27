import { createContext, useContext, useEffect, useRef, useState } from 'react';
import "./../css/terminal.css"


const HostContext = createContext()

function Terminal({handle}){
    const [inputValue, SetInputValue] = useState('')
    const [elements, setElements] = useState([<p>Enter something</p>])
    const [host, setHost] = useState('Joel')
    const bottomRef = useRef(null)
  
    useEffect(
      ()=>{
        if(bottomRef.current){
          bottomRef.current.scrollIntoView()
        }
      },
      [elements]
    )
  
    const handleChange = (e) => {
      SetInputValue(e.target.value)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        switch (inputValue) {
          case 'help':
            setElements([...elements,<p><Hostname /> {inputValue}</p>, <Help /> ])
            break;
          case 'whoami':
            setElements([...elements,<p><Hostname /> {inputValue}</p>, <p> {host}</p>])
            break;
          case 'clear':
            setElements([])
            break;
          case '':
            setElements([...elements,<p><Hostname /></p>])
            break;
          case 'su':
            setElements([])
            setHost('root')
            break;
          case 'start':
            setElements([...elements,<p><Hostname /> {inputValue}</p>, <TerminalAnimation handle={handle}/>])
            break;
          case 'exit':
            window.opener = null;
            window.open("", "_self");
            window.close();
            break;
          default:
            setElements([...elements,<p><Hostname /> {inputValue}</p>, <p style={{color:'red'}}>No command found! Type 'help' to see all commands available</p>])
            break;
        }
        SetInputValue('')
      }
    };
  
    return(
      <div className='terminal'>
        <HostContext.Provider value={host}>
        <Header />
        <br />
        <div className='previous_instructions'>
        <ul>
          {elements.map((element, index) => (
            <li key={index}>{element}</li>
          ))}
        </ul>
        </div>
        <div className='terminal_content'>
          <Hostname />
          <textarea style={{border:"none"}} value = {inputValue} onKeyDown={handleKeyDown} onChange={handleChange}></textarea>
        </div>
        <div ref={bottomRef}></div>
        </HostContext.Provider>
      </div>
    )
  }
  
  function Hostname(){
    const host = useContext(HostContext)
    return(
      <span>{host}@Terminal {'>'} ~$   </span>
    )
  }
  
  
  
  // Header.js
  
  const Header = () => {
    const [fileContent, setFileContent] = useState('');
  
    useEffect(() => {
      const fetchFileContent = async () => {
        try {
          const response = await fetch('/header.txt'); // Fetch the file
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const text = await response.text(); // Read the file as text
          setFileContent(text); // Set the content to state
        } catch (error) {
          console.error('Error fetching the file:', error);
        }
      };
  
      fetchFileContent();
    }, []);
  
    return (
      <div>
        <pre style={{ whiteSpace: 'pre-wrap',fontFamily:'monospace', fontSize:'20px',  padding: '10px', marginTop: '10px' }}>
          {fileContent} {/* Display the file content */}
        </pre>
      </div>
    );
  
  }
  
  const TerminalAnimation = ({handle}) => {
    const [frames, setFrames] = useState(['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [currentMessage, setCurrentMessage] = useState(0);
    const [messages, setMessage] = useState(['Setting the stage ready...'])
    const [breakout, setBreakout] = useState(true)
    const temp_msg = ['Downloading all necessary modules...', 'Loading the website...', 'enjoy!']
  
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
      }, 80);
  
      return () => clearInterval(interval);
    }, []);
  
    useEffect(()=>{
      if(currentMessage === temp_msg.length+1){
        handle()
        return
      }
        const interval = setInterval(() => {
          setMessage([...messages,temp_msg[currentMessage]])
          setCurrentMessage(currentMessage + 1)
         
        }, 1000);
  
        return () => clearInterval(interval);
        
    }, [messages])
  
    return (
      <ul>
        {
          messages.map((message) =>(
            <li>
              <span>{frames[currentFrame]}</span> {message}
            </li>
          ))
        }
  
      </ul>
    );
    
  };
  
  
  //Command prompts
  const Help = () => {
    const commands = [
      { command: 'help', description: 'Displays this help message with all available commands' },
      { command: 'whoami', description: 'Displays the current user name' },
      { command: 'clear', description: 'Clears the terminal screen' },
      { command: 'su', description: 'Log in as root' },
      { command: 'date', description: 'Shows the current date and time' },
      { command: 'ls', description: 'Lists files and directories in the current location' },
      { command: 'echo', description: 'Outputs the entered text' },
      { command: 'exit', description: 'Closes the terminal session' },
      // Add other commands here as needed
    ];
  
    return (
      <div className="terminal-help">
        <h4>Available Commands:</h4>
        <ul>
          {commands.map((cmd, index) => (
            <li key={index}>
              <span className="command">{cmd.command}</span> - {cmd.description}
            </li>
          ))}
        </ul><br/>
      </div>
    );
  };

  export default Terminal;