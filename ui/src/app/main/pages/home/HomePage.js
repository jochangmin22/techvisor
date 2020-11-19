import NavbarFoldedToggleButton from 'app/fuse-layouts/shared-components/NavbarFoldedToggleButton';
import LanguageSwitcher from 'app/fuse-layouts/shared-components/LanguageSwitcher';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import MessageBox from './message-box';
import ClientLogoSlider from './client-logo-slider';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';
// import { BiVector, BiPalette, BiLayout, BiWorld, BiServer } from 'react-icons/bi';
import { BiVector, BiPalette, BiLayout } from 'react-icons/bi';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'transparent',
		'& .navigation': {
			transition: 'all .3s ease',
			'& .navbar': {
				display: 'flex',
				flexDirection: 'row',
				flexWrap: 'nowrap',
				padding: '25px 0',
				transition: 'all .3s ease',
				'& .navbar-brand': {
					display: 'inline-block',
					'& .logo': {
						width: 100,
						height: 32,
						transition: theme.transitions.create(['width', 'height'], {
							duration: theme.transitions.duration.shortest,
							easing: theme.transitions.easing.easeInOut
						})
					}
				},
				'& .navbar-collapse': {
					flexGrow: 1,
					flexBasis: 'auto', //'100%',
					'& .navbar-nav': {
						display: 'flex',
						flexDirection: 'row',
						// flexDirection: 'column',
						paddingLeft: 0,
						marginBottom: 0,
						alignItems: 'center',
						'& .nav-item': {
							margin: 0,
							position: 'relative',
							'& .nav-link': {
								display: 'block',
								padding: 10,
								fontWeight: 500,
								fontSize: '15px'
							}
						}
					}
				}
			}
		},
		'& .fixed-top': {
			top: 0,
			position: 'fixed',
			right: 0,
			left: 0,
			zIndex: 1030
		},
		'& .nav-bg': {
			backgroundColor: '#1f2749',
			boxShadow: '0 10px 20px 0 rgba(0,141,236,.1)'
		},
		'& .hero-section': {
			minHeight: '100vh',
			position: 'relative',
			'&.overlay': {
				'&::before': {
					position: 'absolute',
					content: '""',
					height: '100%',
					width: '100%',
					top: 0,
					left: 0,
					background: '#1f2749',
					opacity: '.8'
				}
			},
			'& .hero-content': {
				width: '100%',
				padding: '50px 0',
				position: 'absolute',
				left: 0,
				right: 0,
				top: '40%',
				transform: 'translateY(-50%)'
			}
		},
		'& .section': {
			paddingTop: '100px',
			paddingBottom: '100px',
			[theme.breakpoints.down('md')]: {
				display: 'block'
			},
			'& .section-title': {
				marginBottom: '50px',
				fontSize: '45px',
				[theme.breakpoints.down('md')]: {
					fontSize: '36px'
				}
			},
			'& .card': {
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				minWidth: 0,
				wordWrap: 'break-word',
				backgroundColor: 'rgb(34, 36, 37)',
				borderColor: 'rgba(139, 130, 116, 0.13)',
				// backgroundColor: '#fff',
				backgroundClip: 'border-box',
				border: '1px solid rgba(0,0,0,.125)',
				borderRadius: '.25rem',
				'& .card-body': {
					flex: '1 1 auto',
					// padding: '1.25rem',
					'& .card-title': {
						marginBottom: '.75rem'
					},
					'& .icon-rounded': {
						width: '80px',
						height: '80px',
						lineHeight: '80px',
						display: 'inline-block',
						// borderRadius: '50%',
						borderRadius: '9999px',
						fontSize: '30px'
					}
				}
			}
		}
	}
}));

function LandingPage() {
	const classes = useStyles();
	// const theme = useTheme();
	// const videoSource = 'assets/videos/main_bg_video.mp4';

	AOS.init();

	const [scrollTop, setScrollTop] = useState(0);

	useEffect(() => {
		function onScroll() {
			let currentPosition = document.documentElement.scrollTop;
			setScrollTop(currentPosition <= 0 ? 0 : currentPosition);
		}

		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [scrollTop]);

	return (
		<div className={classes.root}>
			{/* <div className="preloader" style="display: none;"></div> */}
			<header className={clsx('navigation fixed-top', scrollTop === 0 ? '' : 'nav-bg')}>
				<Container className="flex">
					<nav className="navbar w-full relative justify-between items-center">
						<Link className="navbar-brand cursor-pointer" to="/home" role="button">
							<img className="logo" src="assets/images/logos/logo_ipgrim_shadow.svg" alt="TechVisor" />
						</Link>
						<Hidden lgUp>
							<NavbarFoldedToggleButton className="w-40 h-40 p-0" />
						</Hidden>
						{/* <button
							className="navbar-toggler border-0"
							type="button"
							data-toggle="collapse"
							data-target="#navigation"
						>
							<i class="ti-align-right h3 text-white"></i>
						</button> */}
						<div
							className="navbar-collapse hidden md:flex collapse text-center items-center"
							id="navigation"
						>
							<ul className="navbar-nav ml-auto">
								<li className="nav-item">
									<Button className="nav-link" to="/apps/searchs" component={Link}>
										기술검색
									</Button>
								</li>
								<li className="nav-item">
									<Button className="nav-link" to="/apps/companies" component={Link}>
										기업검색
									</Button>
								</li>
								<li className="nav-item">
									<Button className="nav-link" to="/apps/searchs" component={Link}>
										Contact
									</Button>
								</li>
								<li className="nav-item">
									<div className="nav-link">
										<LanguageSwitcher />
									</div>
								</li>
							</ul>
						</div>
					</nav>
				</Container>
			</header>
			<section
				className="hero-section overlay bg-cover"
				style={{
					backgroundImage: 'url(http://demo.themefisher.com/redlab-hugo/images/backgrounds/banner.jpg)'
				}}
			>
				{/* <video
					className="absolute w-full h-screen top-0 left-0 object-cover opacity-50"
					autoPlay
					loop
					muted
					playsInline
				>
					<source src={videoSource} type="video/mp4" />
					Your browser does not support the video tag.
				</video> */}
				<div className="hero-content">
					<Container className="flex justify-center">
						<div className="flex flex-wrap -mx-12">
							<div className="w-5/6 mx-auto text-center">
								<Typography color="inherit" className="text-40 md:text-72 font-800 leading-tight mb-32">
									Tech Visor
								</Typography>
								<Typography color="inherit" className="text-20 md:text-32 font-500 leading-tight mb-32">
									AI 기반 IP-비지니스 분석 플랫폼
								</Typography>
								<div className="max-w-lg mb-72">
									<MessageBox />
								</div>

								<div className="flex flex-row mx-auto items-center justify-center">
									<Link
										role="button"
										to="/login"
										className="flex p-12 md:p-24 mr-24 w-136 md:w-192 rounded-lg items-center justify-center bg-blue-600 hover:bg-blue-500 text-14 md:text-20"
									>
										시작하기 <Icon>arrow_forward</Icon>
									</Link>
									<a
										role="button"
										href="https://www.notion.so/jingu0705/060138803fe046d4a4d4eaab641ca06a"
										target="_blank"
										rel="noreferrer noopener"
									>
										<div className="flex p-12 md:p-24 w-136 md:w-192 rounded-lg items-center justify-center hover:bg-blue-500 active:bg-blue-600 transition duration-300 ease-in-out border border-blue-400 hover:text-white text-14 md:text-20">
											더 알아보기 <Icon>arrow_forward</Icon>
										</div>
									</a>
								</div>
								{/*<h1 className="text-white mb-5 text-capitalize">
									The development of technological solutions is our forte
								</h1>
								<p className="text-light mb-4 mx-lg-5 px-lg-5 content">
									Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illum voluptatem enim
									quibusdam a necessitatibus! Adipisci culpa inventore harum optio vitae totam
									aliquam, iusto minus quo hic ipsam.
								</p>
								<a href="http://demo.themefisher.com/redlab-hugo/about" className="btn btn-primary m-2">
									Explore Us
								</a> */}
							</div>
						</div>
					</Container>
				</div>
			</section>
			<section className="bg-primary py-16">
				<Container className="flex">
					<div className="flex flex-wrap w-full justify-center md:justify-between items-center flex-col md:flex-row">
						<div className="text-center md:text-left mb-16 md:mb-0">
							<div className="text-white text-24">Looking for First-Class PHP Developer?</div>
						</div>
						<div className="text-center md:text-right">
							<a
								role="button"
								href="https://www.notion.so/jingu0705/060138803fe046d4a4d4eaab641ca06a"
								target="_blank"
								rel="noreferrer noopener"
							>
								<div className="flex p-6 md:p-12 w-136 md:w-192 items-center justify-center hover:bg-blue-500 active:bg-blue-600 transition duration-300 ease-in-out border border-blue-400 hover:text-white text-14 md:text-20">
									더 알아보기 <Icon>arrow_forward</Icon>
								</div>
							</a>
						</div>
					</div>
				</Container>
			</section>
			<section className="section bg-secondary-white">
				<Container className="flex justify-center">
					<div className="row">
						<div className="col-md-6 mb-4 mb-md-0 pr-lg-5">
							<img
								src="http://demo.themefisher.com/redlab-hugo/images/about/about.jpg"
								alt="about"
								className="img-fluid"
							/>
						</div>
						<div className="col-md-6 pl-lg-4">
							<div className="content mb-4">
								<h2 id="we-are-here-to-always-br-help-you">We are here to always help you</h2>
								<p>
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi obcaecati earum quia
									accusamus quaerat suscipit sit saepe amet explicabo.
								</p>
								<p>
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero voluptatibus quod
									placeat eius dolorum cumque neque fugiat. Praesentium consequatur beatae eum
									quibusdam deleniti vero repellat numquam molestiae labore repellendus enim tempore
									laborum alias aut ex
								</p>
							</div>
							<a href="http://demo.themefisher.com/redlab-hugo/about" className="btn btn-primary">
								know more
							</a>
						</div>
					</div>
				</Container>
			</section>
			<section className="section bg-light">
				<Container className="flex justify-center">
					<div className="row">
						<div className="col-12 text-center">
							<h2 className="section-title">What People Say?</h2>
						</div>
					</div>
					<div className="row">
						<div className="col-lg-4 col-md-6">
							<div className="testimonial-item">
								<div className="comment match-height content" style={{ height: '258px' }}>
									Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis voluptate modi
									sunt placeat in vel illo dolorem, atque maxime voluptates optio fugit iure cum ipsa
									quo quaerat
								</div>
								<div className="person">
									<div className="media">
										<img
											src="http://demo.themefisher.com/redlab-hugo/images/testimonial/client-1.jpg"
											alt="John Doe"
										/>
										<div className="media-body">
											<h5>John Doe</h5>
											<p className="mb-0">Web Developer</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6">
							<div className="testimonial-item">
								<div className="comment match-height content" style={{ height: '258px' }}>
									Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis voluptate modi
									sunt placeat in vel illo dolorem, atque maxime voluptates optio fugit iure cum ipsa
									quo quaerat! Veritatis, modi. Laudantium provident deleniti earum voluptas delectus,
									labore dolor dolorem amet expedita.
								</div>
								<div className="person">
									<div className="media">
										<img
											src="http://demo.themefisher.com/redlab-hugo/images/testimonial/client-2.jpg"
											alt="Jinat Rin"
										/>
										<div className="media-body">
											<h5>Jinat Rin</h5>
											<p className="mb-0">UI/UX Designer</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-lg-4 col-md-6">
							<div className="testimonial-item">
								<div className="comment match-height content" style={{ height: '258px' }}>
									Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis voluptate modi
									sunt placeat in vel illo dolorem, atque maxime voluptates optio fugit iure cum ipsa
									quo quaerat! Veritatis, modi.
								</div>
								<div className="person">
									<div className="media">
										<img
											src="http://demo.themefisher.com/redlab-hugo/images/testimonial/client-3.jpg"
											alt="Mark Din"
										/>
										<div className="media-body">
											<h5>Mark Din</h5>
											<p className="mb-0">Web Developer</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</section>
			<section className="section">
				<Container className="flex justify-center">
					<div className="flex flex-wrap">
						<div className="w-full text-center">
							<Typography className="section-title text-12">WHAT WE DO</Typography>
						</div>
						<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
							<div className="card rounded-0 text-center hover:bg-blue">
								<div className="card-body p-16">
									<div className="icon-rounded bg-blue mb-16">
										<BiVector size="24" className="inline-block" />
									</div>
									<Typography className="card-title text-16">유망한 기업 찾기</Typography>
									<p className="card-text content">
										관심 키워드, 주제어 검색을 통해 유망 기술 & R&D기업 찾기
									</p>
								</div>
							</div>
						</div>
						<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
							<div className="card rounded-0 text-center hover:bg-blue">
								<div className="card-body p-16">
									<div className="icon-rounded bg-blue mb-16">
										<BiPalette size="24" className="inline-block" />
									</div>
									<Typography className="card-title text-16">관심기업의 다양한 분석정보</Typography>
									<p className="card-text content">
										관심 기업의 실시간 시세, 재무, 공시, 임상, 특허, 적정주가 분석하기
									</p>
								</div>
							</div>
						</div>
						<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
							<div className="card rounded-0 text-center hover:bg-blue">
								<div className="card-body p-16">
									<div className="icon-rounded bg-blue mb-16">
										<BiLayout size="24" className="inline-block" />
									</div>
									<Typography className="card-title text-16">시각화 자료 제공</Typography>
									<p className="card-text content">
										다양한 시각화를 통해 여러분의 콘텐츠를 화려하게 만들어 드립니다
									</p>
								</div>
							</div>
						</div>
						{/* <div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
							<div className="card rounded-0 text-center hover:bg-blue">
								<div className="card-body p-16">
									<div className="icon-rounded bg-blue mb-16">
										<BiWorld size="24" className="inline-block" />
									</div>
									<Typography className="card-title text-16">Web Development</Typography>
									<p className="card-text content">
										Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque nisi aut
										cumque pariatur repellendus repellat debitis molestias
									</p>
								</div>
							</div>
						</div>
						<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
							<div className="card rounded-0 text-center hover:bg-blue">
								<div className="card-body p-16">
									<div className="icon-rounded bg-blue mb-16">
										<BiServer size="24" className="inline-block" />
									</div>
									<Typography className="card-title text-16">Database Management</Typography>
									<p className="card-text content">
										Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque nisi aut
										cumque pariatur repellendus repellat debitis molestias
									</p>
								</div>
							</div>
						</div>
						<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
							<div className="card rounded-0 text-center hover:bg-blue">
								<div className="card-body p-16">
									<div className="icon-rounded bg-blue mb-16">
										<BiPalette size="24" className="inline-block" />
									</div>
									<Typography className="card-title text-16">Cloud Service</Typography>
									<p className="card-text content">
										Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque nisi aut
										cumque pariatur repellendus repellat debitis molestias
									</p>
								</div>
							</div>
						</div> */}
					</div>
				</Container>
			</section>
			<section className="section">
				<Container className="flex justify-center">
					<div className="flex flex-wrap">
						<div className="w-full text-center">
							<Typography className="section-title text-12">We work With</Typography>
						</div>
						<div className="">
							<ClientLogoSlider />
						</div>
					</div>
				</Container>
			</section>
			<footer
				className="footer bg-cover overlay overflow-hidden"
				style={{
					backgroundImage: 'url(http://demo.themefisher.com/redlab-hugo/images/backgrounds/footer.jpg)'
				}}
			>
				<Container className="flex justify-center">
					<div className="row">
						<div className="col-lg-3 bg-secondary footer-block">
							<a
								href="http://demo.themefisher.com/redlab-hugo/"
								className="d-flex h-100 align-items-center justify-content-center"
							>
								<img
									className="img-fluid"
									src="http://demo.themefisher.com/redlab-hugo/images/logo.png"
									alt="RedLab | IT Company Template"
								/>
							</a>
						</div>
						<div className="col-lg-9">
							<div className="row pl-lg-5 pl-0 py-5">
								<div className="col-lg-4 mb-4 mb-lg-0">
									<h5 className="text-white mb-4">About RedLab</h5>
									<p className="text-white content">
										Lorem ipsum dolor amet consectetur adipisicing elit sed eiusm tempor incididunt
										ut labore dolore magna aliqua enim ad minim veniam quis nostrud exercitation
										ullamaboris nisi ut aliquip.exea commodo consequat.
									</p>
								</div>
								<div className="col-lg-4 col-sm-6 mb-4 mb-sm-0">
									<h5 className="text-white mb-4">Our Company</h5>
									<ul className="list-unstyled">
										<li className="text-white pb-3">
											<a href="http://demo.themefisher.com/redlab-hugo/blog">Latest News</a>
										</li>
										<li className="text-white pb-3">
											<a href="http://demo.themefisher.com/redlab-hugo/about">About US</a>
										</li>
										<li className="text-white pb-3">
											<a href="http://demo.themefisher.com/redlab-hugo/service">Our Service</a>
										</li>
										<li className="text-white pb-3">
											<a href="http://demo.themefisher.com/redlab-hugo/blog">Privacy Policy</a>
										</li>
									</ul>
								</div>
								<div className="col-lg-4 col-sm-6">
									<h5 className="text-white mb-4">Contact Us</h5>
									<ul className="list-unstyled">
										<li className="text-white pb-3">
											<i className="ti-mobile mr-2"></i>+211234565523
										</li>
										<li className="text-white pb-3">
											<i className="ti-email mr-2"></i>
											<a href="mailto:info@redlab.com">info@redlab.com</a>
										</li>
									</ul>
									<h5 className="text-white mb-4">Connect With Us</h5>
									<ul className="list-inline">
										<li className="list-inline-item mx-2 text-white">
											<a href="#none">
												<i className="ti-facebook"></i>
											</a>
										</li>
										<li className="list-inline-item mx-2 text-white">
											<a href="#none">
												<i className="ti-twitter-alt"></i>
											</a>
										</li>
										<li className="list-inline-item mx-2 text-white">
											<a href="#none">
												<i className="ti-linkedin"></i>
											</a>
										</li>
										<li className="list-inline-item mx-2 text-white">
											<a href="#none">
												<i className="ti-github"></i>
											</a>
										</li>
										<li className="list-inline-item mx-2 text-white">
											<a href="#none">
												<i className="ti-instagram"></i>
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</Container>
			</footer>
			{/* <script>var indexURL="http://demo.themefisher.com/redlab-hugo/index.json"</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBu5nZKbeK-WHQ70oqOWo-_4VmwOwKP9YQ"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/jQuery/jquery.min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/bootstrap/bootstrap.min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/slick/slick.min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/match-height/jquery.matchHeight-min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/shuffle/shuffle.min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/magnific-popup/jquery.magnific.popup.min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/search/fuse.min.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/search/mark.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/search/search.js"></script><script src="http://demo.themefisher.com/redlab-hugo/plugins/google-map/gmap.js"></script><script src="http://demo.themefisher.com/redlab-hugo/js/script.min.js"></script> */}
		</div>
	);
}

export default LandingPage;
