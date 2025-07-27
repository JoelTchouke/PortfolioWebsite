import './assets/css/font-awesome.min.css';
import './assets/css/flaticon.css';
import './assets/css/animate.css';
import './assets/css/owl.carousel.min.css';
import './assets/css/owl.theme.default.min.css';
import './assets/css/bootstrap.min.css';
import './assets/css/bootsnav.css';
import './assets/css/style.css';
import './assets/css/responsive.css';
import JoelImg from "../img/JoelT3.jpg"
import img1 from "../img/1.JPG"
import img2 from "../img/2.JPG"
import img3 from "../img/3.jpg"
import img4 from "../img/4.jpg"
import img5 from "../img/5.jpg"
import img6 from "../img/6.jpg"
import img7 from "../img/7.jpg"
import img8 from "../img/8.JPG"
import img9 from "../img/9.jpg"


import { useContext, useState } from 'react';



const hobbies = [
    { title: 'Music', description: 'I love music and play several intrument. Music is truly my passion.' },
    { title: 'Coding', description: 'I love solving problems through programming and building cool projects.' },
    { title: 'Traveling', description: 'Exploring new places and cultures is a big passion of mine.' },
    { title: 'Photography', description: 'Capturing beautiful moments through the lens is one of my favorite activities.' },
  ];


	const albumData = [
	  {
		title: 'Song 1',
		image: img1,
		description: 'Description of Song 1.'
	  },
	  {
		title: 'Song 2',
		image: img2,
		description: 'Description of Song 2.'
	  },
	  {
		title: 'Song 3',
		image: img3,
		description: 'Description of Song 3.'
	  },
	  {
		title: 'Song 4',
		image: img4,
		description: 'Description of Song 4.'
	  },
	  {
		title: 'Song 4',
		image: img5,
		description: 'Description of Song 4.'
	  },
	  {
		title: 'Song 4',
		image: img6,
		description: 'Description of Song 4.'
	  },
	  {
		title: 'Song 4',
		image: img7,
		description: 'Description of Song 4.'
	  },
	  {
		title: 'Song 4',
		image: img8,
		description: 'Description of Song 4.'
	  },
	  {
		title: 'Song 4',
		image: img9,
		description: 'Description of Song 4.'
	  },
	];

function About({context}){
	 const [display, setDisplay] = useState(true)
	  const {targetFocus, setTargetFocus} = useContext(context) 
	  const handleClick = ()=>{
		setDisplay(false)
		setTimeout(() => {
		  setTargetFocus('origin')
		}, 750);
	  }
    return(
        <section className= {display ? 'aboutme_content': "aboutme_content_out"} style={{position:"absolute", minHeight:"100vh", color:"white", top:0 , width:"100%", zIndex:2}} >
		<header class="top-area">
			<div class="header-area">
				
			    <nav class="navbar navbar-default bootsnav navbar-fixed dark no-background">

			        <div class="container">

			            <div class="navbar-header">
			                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbar-menu">
			                    <i class="fa fa-bars"></i>
			                </button>
			                <a class="navbar-brand" href="#">							<button className='buttonS' style={{zIndex:10000, color:"white", background:"black"}} onClick={handleClick}>Exit</button>	
							Joel Tchouke</a>
			            </div>

			            <div class="collapse navbar-collapse menu-ui-design" id="navbar-menu">
			                <ul class="nav navbar-nav navbar-right" data-in="fadeInDown" data-out="fadeOutUp">
			                <li class=" smooth-menu active"></li>
							<li class=" smooth-menu"><a href="#about">about me</a></li>
			                    <li class=" smooth-menu"><a href="#education">education</a></li>
								<li class=" smooth-menu"><a href="#goals">goals</a></li>
								<li class=" smooth-menu"><a href="#hobbies">hobbies</a></li>
								<li class=" smooth-menu"><a href="#education">album</a></li>

			                    <li class="smooth-menu"><a href="#experience">experience</a></li>
			                </ul>        </div>
			        </div>	    </nav>
			</div>
		    <div class="clearfix"></div>

		</header>
		<section id="welcome-hero" class="welcome-hero">
			<div class="container">
				<div class="row">
					<div class="col-md-12 text-center">
						<div class="header-text">
							<h2>hi <span>,</span> I am <br /> Joel Tchouke <span>.</span>   </h2>
							<p>Honor Student</p>
						</div>					
                    </div>	
                <div />
			</div>
			</div>
        </section>

			<section id="about" class="about">
			<div class="section-heading text-center">
				<h2>about me</h2>
			</div>
			<div class="container">
				<div class="about-content">
					<div class="row">
						<div class="col-sm-6">
							<div class="single-about-txt">
								<h3 style={{textAlign: "justify",textJustify: "inter-word"}}>
								I am a third-year Honors student at Minnesota State University, Mankato, pursuing a degree in Computer Engineering with a minor in Physics. Throughout my academic journey, I have consistently earned a spot on the Dean’s List and strive to apply my theoretical knowledge to real-world challenges. My skill set spans cybersecurity, software development, and circuit design, with hands-on experience in projects like optimizing power efficiency for robotics and developing advanced smart glasses with object recognition and wireless communication. I am also passionate about leadership and currently serve as President of the Cybersecurity Association and Vice President of both the African Student Association and the International Student Association. My commitment to helping others succeed is reflected in my work as a MavPASS tutor and my role as a Maverick Global Ambassador. I am dedicated to innovation, leadership, and intercultural engagement, and I aim to continue growing as a student leader and contributing to my community.								
								</h3>
								<div class="row">
									<div class="col-sm-4">
										<div class="single-about-add-info">
											<h3>phone</h3>
											<p>929-339-7034</p>
										</div>
									</div>
									<div class="col-sm-4">
										<div class="single-about-add-info">
											<h3>email</h3>
											<p>yvesjoel.tchouke@mnsu.edu</p>
											<p>tchoukejoel2000@gmail.com</p>
										</div>
									</div>
									<div class="col-sm-4">
										<div class="single-about-add-info">
											<h3>website</h3>
											<p>joeltchouke.com</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="col-sm-offset-1 col-sm-5">
							<div class="">
								<img width={"100%"} src={JoelImg} alt="profile_image" />
								<div class="about-list-icon">
									<ul>
										<li>
											<a target='_blank' href="https://www.facebook.com/profile.php?id=100012423349286">
												<i  class="fa fa-facebook" aria-hidden="true"></i>
											</a>
										</li>							<li>
											<a target='_blank' href="https://www.linkedin.com/in/joel-tchouke-197390280/">
												<i  class="fa fa-linkedin" aria-hidden="true"></i>
											</a>
										</li>			<li>
											<a target='_blank' href="https://www.instagram.com/t_j20__/">
												<i  class="fa fa-instagram" aria-hidden="true"></i>
											</a>
										</li>			
										
									</ul>	</div>

							</div>

						</div>
					</div>
				</div>
			</div>
		</section>
		<section id='goals'>
		<div class="section-heading text-center">
				<h2>My goals</h2>

			</div>
			<br /><br />

			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding:"10px" }}>

      {/* Box 1 */}
	  
      <div
        style={{
          flex: '1 1 calc(50% - 20px)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h1 style={{fontSize:"20px", fontWeight:"bold"}}>AS AN ENGINEER</h1>
		<br />
        <p>As an engineer, my goals are to solve real-world problems by developing solutions that improve people's lives. I aim to continually learn and stay curious about new technologies and methods, ensuring that I grow as an engineer. Collaboration and leadership are important to me, and I want to work well with others, share ideas, and lead teams to create innovative solutions. I also strive to design solutions that are not only effective but sustainable, considering the environment and society in my decisions. Ultimately, my goal is to use my engineering knowledge to make a positive impact on the world, whether through creating useful products, contributing to research, or addressing challenges that affect communities.</p>
      </div>

      {/* Box 2 */}
      <div
        style={{
          flex: '1 1 calc(50% - 20px)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h3 style={{fontSize:"20px", fontWeight:"bold"}}>AS A LEADER</h3>
		<br />
        <p>As a leader, my goals are to inspire and motivate others to reach their full potential. I want to create an environment where teamwork, open communication, and collaboration thrive. I aim to lead by example, making thoughtful decisions that consider both short-term and long-term impacts. I also strive to empower those around me, helping them develop their skills and confidence. My leadership approach focuses on fostering innovation and supporting growth, ensuring that everyone has the opportunity to contribute and succeed. Ultimately, I want to lead in a way that makes a positive difference, not just in the projects I oversee but in the lives of those I work with.</p>
      </div>

      {/* Box 3 */}
      <div
        style={{
          flex: '1 1 calc(50% - 20px)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h3 style={{fontSize:"20px", fontWeight:"bold"}}>AS A MUSICIAN</h3>
		<br />
        <p>As a musician, my goals are to continually develop my skills and explore new ways to express myself through music. I want to create music that resonates with others, sharing emotions and stories that connect people. I aim to collaborate with other musicians, learn from different styles, and expand my musical knowledge. I also strive to challenge myself, pushing boundaries and experimenting with new techniques and genres. Ultimately, my goal is to inspire others through my music and contribute to the rich diversity of sounds that make up the world of music.</p>
      </div>

      {/* Box 4 */}
      <div
        style={{
          flex: '1 1 calc(50% - 20px)',
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h3 style={{fontSize:"20px", fontWeight:"bold"}}>AS A HUMAN</h3>
		<br />
        <p>As a human, my goals are to live with kindness, empathy, and integrity. I strive to grow and learn from my experiences, always seeking to improve myself and my understanding of the world. I want to build meaningful relationships, support others, and contribute to the well-being of those around me. I aim to stay true to my values, be open-minded, and embrace diversity. Above all, my goal is to make a positive impact on the lives of others, leaving the world a little better than I found it.</p>
      </div>
    </div>
	<br />
	<br />
			</section>
			<section id='hobbies' style={{ padding: '20px', backgroundColor: '#f4f4f4' }}>
			<div class="section-heading text-center">
				<h2>My Hobbies</h2>

			</div>      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        {hobbies.map((hobby, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              margin: '10px',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              width: '23%',
            }}
          >
            <h3 style={{ textAlign: 'center', color: '#333', fontWeight:"bold" }}>{hobby.title}</h3>
            <p style={{ color: '#666', textAlign: 'center' }}>{hobby.description}</p>
          </div>
        ))}
      </div>
    </section>
		<section id="education" class="education">
			<div class="section-heading text-center">
				<h2>education</h2>
			</div>
			<div class="container">
				<div class="education-horizontal-timeline">
					<div class="row" style={{display:"flex", justifyContent:"center"}}>
						
						<div class="col-sm-4">
							<div class="single-horizontal-timeline">
								<div class="experience-time">
									<h2>2022 - 2026 (expected)</h2>
									<h3>bachelor <span>of </span> Computer Engineering</h3>
								</div>-
								<div class="timeline-horizontal-border">
									<i class="fa fa-circle" aria-hidden="true"></i>
									<span class="single-timeline-horizontal spacial-horizontal-line
									"></span>
								</div>
								<div class="timeline">
									<div class="timeline-content">
										<h4 class="title">
											 Minnesota State University, Mankato
										</h4>
										<h5>Mankato, United States</h5>
										<p class="description">
											I have been studying at Minniesota State University in Computer Engineering/Physics for 3 years now.</p>
									</div>
								</div>				</div>
						</div>
					</div>
				</div>
			</div>
			

		</section>		
        <section className="album-container">
		<h2 className="album-title">Album</h2>
		<div className="album-gallery">
			{albumData.map((item, index) => (
			<div key={index} className="album-item">
				<img src={item.image} alt={item.title} className="album-image" />
			</div>
			))}
		</div>
		</section>
		<section id="experience" class="experience">
    <div class="section-heading text-center">
        <h2>experience</h2>
    </div>
    <div class="container">
        <div class="experience-content">
            <div class="main-timeline">
                <ul>
                    <li>
                        <div class="single-timeline-box fix">
                            <div class="row">
                                <div class="col-md-5">
                                    <div class="experience-time text-right">
                                        <h2>2023 - Present</h2>
                                        <h3>Research Student Assistant</h3>
                                    </div>
                                </div>
                                <div class="col-md-offset-1 col-md-5">
                                    <div class="timeline">
                                        <div class="timeline-content">
                                            <h4 class="title">
                                                <span><i class="fa fa-circle" aria-hidden="true"></i></span>
                                                Professor Winstead's Research Lab
                                            </h4>
                                            <h5>Mankato, USA</h5>
                                            <p class="description">
                                                I work on a project aimed at improving the energy efficiency of robotics. My task is to design small electronics, including a battery level indicator and a sleep mode for saving energy. I also work with KiCad to create PCB designs and use the ATtiny85 microcontroller for the project.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="single-timeline-box fix">
                            <div class="row">
                                <div class="col-md-offset-1 col-md-5 experience-time-responsive">
                                    <div class="experience-time">
                                        <h2>2024 - Present</h2>
                                        <h3>President, CyberSecurity Association</h3>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <div class="timeline">
                                        <div class="timeline-content text-right">
                                            <h4 class="title">
                                                CyberSecurity Association, MNSU
                                            </h4>
                                            <h5>Mankato, USA</h5>
                                            <p class="description">
                                                As President, I lead the CyberSecurity Association, organizing events and training to help students learn about cybersecurity. I also work with other organizations to raise awareness about security topics and create opportunities for students to participate in cybersecurity competitions.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="single-timeline-box fix">
                            <div class="row">
                                <div class="col-md-5">
                                    <div class="experience-time text-right">
                                        <h2>2023 - Present</h2>
                                        <h3>Vice President, African Student Association</h3>
                                    </div>
                                </div>
                                <div class="col-md-offset-1 col-md-5">
                                    <div class="timeline">
                                        <div class="timeline-content">
                                            <h4 class="title">
                                                African Student Association, MNSU
                                            </h4>
                                            <h5>Mankato, USA</h5>
                                            <p class="description">
                                                In my role as Vice President, I help plan cultural events that celebrate African heritage. I work to create a welcoming space for African and international students and encourage cultural exchange through various activities.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="single-timeline-box fix">
                            <div class="row">
                                <div class="col-md-offset-1 col-md-5 experience-time-responsive">
                                    <div class="experience-time">
                                        <h2>2024 - Present</h2>
                                        <h3>Vice President, International Student Association</h3>
                                    </div>
                                </div>
                                <div class="col-md-5">
                                    <div class="timeline">
                                        <div class="timeline-content text-right">
                                            <h4 class="title">
                                                International Student Association, MNSU
                                            </h4>
                                            <h5>Mankato, USA</h5>
                                            <p class="description">
                                                As Vice President, I support international students by organizing events and activities to help them feel at home. My role involves bringing students from different cultures together to create a more inclusive environment on campus.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    <li>
                        <div class="single-timeline-box fix">
                            <div class="row">
                                <div class="col-md-5">
                                    <div class="experience-time text-right">
                                        <h2>2022 - 2024</h2>
                                        <h3>Vice President, MavPASS</h3>
                                    </div>
                                </div>
                                <div class="col-md-offset-1 col-md-5">
                                    <div class="timeline">
                                        <div class="timeline-content">
                                            <h4 class="title">
                                                MavPASS, MNSU
                                            </h4>
                                            <h5>Mankato, USA</h5>
                                            <p class="description">
                                                I helped organize tutoring sessions for subjects like electrical engineering and circuit analysis. I worked with other tutors to assist students in improving their academic skills and fostered a collaborative environment for learning.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>

                    
                </ul>
            </div>
        </div>
    </div>
</section>
		
		<footer id="footer-copyright" class="footer-copyright">
			<div class="container">
				<div class="hm-footer-copyright text-center">
					<p>
						&copy; copyright Joel Tchouke.
					</p>			</div>		<div id="scroll-Top">
				<div class="return-to-top">
					<i class="fa fa-angle-up " id="scroll-top" ></i>
				</div>
				</div></div>
        </footer>
		
        
</section> )
}

export default About;