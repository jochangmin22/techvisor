import FuseAnimate from '@fuse/core/FuseAnimate';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Icon from '@material-ui/core/Icon';
import React from 'react';
import MessageBox from './message-box';
// import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'transparent',
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
				top: '50%',
				transform: 'translateY(-50%)',
				color: theme.palette.primary.contrastText
			}
		},
		'& .section': {
			paddingTop: '100px',
			paddingBottom: '100px',
			[theme.breakpoints.down('md')]: {
				paddingTop: '24px',
				paddingBottom: '24px',
				display: 'block'
			},
			'& .section-title': {
				marginBottom: '80',
				[theme.breakpoints.down('md')]: {
					marginBottom: '24'
				},
				'& .h6': {
					color: '#ffae47',
					letterSpacing: '1.2rem',
					fontSize: '16px',
					[theme.breakpoints.down('md')]: {
						fontSize: '12px'
					}
				},
				'& .h1': {
					fontWeight: 700,
					color: '#000',
					fontSize: '36px',
					[theme.breakpoints.down('md')]: {
						fontSize: '24px'
					}
				}
			},
			'& .card': {
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				minWidth: 0,
				wordWrap: 'break-word',
				// backgroundColor: 'rgb(34, 36, 37)',
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
	// const videoSource = 'assets/videos/main_bg_video.mp4';
	const videoSource = 'http://btowin.synology.me:1111/assets/videos/main_bg_video.mp4';

	return (
		<div className={classes.root}>
			<section
				className="hero-section overlay bg-cover"
				style={{
					backgroundImage: 'url(http://demo.themefisher.com/redlab-hugo/images/backgrounds/banner.jpg)'
				}}
			>
				<video
					className="absolute w-full h-screen top-0 left-0 object-cover opacity-50"
					autoPlay
					loop
					muted
					playsInline
				>
					<source src={videoSource} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
				<div className="hero-content">
					<Container className="flex justify-center">
						<div className="flex flex-wrap -mx-12">
							<div className="w-5/6 mx-auto text-center">
								<Typography color="inherit" className="text-40 md:text-96 font-800 leading-tight mb-32">
									Tech Visor
								</Typography>
								<Typography
									color="inherit"
									className="text-20 md:text-24 font-500 leading-tight mb-128"
								>
									AI 기반 IP-비지니스 분석 플랫폼
								</Typography>
								<div className="max-w-lg mb-128">
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
							</div>
						</div>
					</Container>
				</div>
			</section>
			<section
				className="section overlay bg-cover"
				style={{
					backgroundImage: 'url(http://demo.themefisher.com/icelab-hugo/images/shape-big.png)'
				}}
			>
				<Container className="flex">
					<div className="flex flex-col">
						<div className="section-title w-full h-auto">
							<FuseAnimate animation="transition.slideUpIn" delay={1500}>
								<Typography className="h6 mb-24">WHAT WE DO</Typography>
							</FuseAnimate>
							<FuseAnimate animation="transition.slideUpIn" delay={2000}>
								<Typography className="h1">
									기업, 기술에 대해
									<br />
									다양한 분석정보를 제공
								</Typography>
							</FuseAnimate>
						</div>
						<div className="section">
							<Container className="flex justify-center">
								<div className="flex flex-wrap">
									<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
										<div className="card rounded-0 text-center hover:bg-gray-200">
											<div className="card-body p-16">
												<div className="mb-48">
													<img
														className="w-32 h-32 sm:w-48 sm:h-48 mr-8 sm:mr-16 rounded inline-block"
														src="assets/images/icons/icon-1.svg"
														alt=""
													/>
												</div>
												<Typography className="card-title text-20">유망한 기업 찾기</Typography>
												<p className="card-text content">
													관심 키워드, 주제어 검색을 통해 유망 기술 & R&D기업 찾기
												</p>
											</div>
										</div>
									</div>
									<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
										<div className="card rounded-0 text-center hover:bg-gray-200">
											<div className="card-body p-16">
												<div className="mb-48">
													<img
														className="w-32 h-32 sm:w-48 sm:h-48 mr-8 sm:mr-16 rounded inline-block"
														src="assets/images/icons/icon-2.svg"
														alt=""
													/>
												</div>
												<Typography className="card-title text-20">
													관심기업의 다양한 분석정보
												</Typography>
												<p className="card-text content">
													관심 기업의 실시간 시세, 재무, 공시, 임상, 특허, 적정주가 분석하기
												</p>
											</div>
										</div>
									</div>
									<div className="w-full sm:w-1/2 md:w-1/3 px-16 mb-16">
										<div className="card rounded-0 text-center hover:bg-gray-200">
											<div className="card-body p-16">
												<div className="mb-48">
													<img
														className="w-32 h-32 sm:w-48 sm:h-48 mr-8 sm:mr-16 rounded inline-block"
														src="assets/images/icons/icon-3.svg"
														alt=""
													/>
												</div>
												<Typography className="card-title text-20">시각화 자료 제공</Typography>
												<p className="card-text content">
													다양한 시각화를 통해 여러분의 콘텐츠를 화려하게 만들어 드립니다
												</p>
											</div>
										</div>
									</div>
								</div>
							</Container>
						</div>

						{/* <div className="flex flex-row w-full">
							<div className="flex w-1/2 md:w-1/3">
								<div className="service-item hover">
									<div className="mb-48">
										<img src="assets/images/icons/icon-1.svg" alt="" />
									</div>
									<div className="content">
										<h6 className="sm">기술검색 활용법</h6>
										<p>관심 키워드, 주제어 검색을 통해 유망 기술 & R&D기업 찾기</p>
									</div>
								</div>
							</div>
							<div className="flex w-1/2 md:w-1/3">
								<div className="service-item">
									<div className="mb-48">
										<img src="assets/images/icons/icon-2.svg" alt="" />
									</div>
									<div className="content">
										<h6 className="sm">기업검색 활용법</h6>
										<p>관심 기업의 실시간 시세, 재무, 공시, 임상, 특허, 적정주가 분석하기</p>
									</div>
								</div>
							</div>
							<div className="flex w-1/2 md:w-1/3">
								<div className="service-item">
									<div className="mb-48">
										<img src="assets/images/icons/icon-3.svg" alt="" />
									</div>
									<div className="content">
										<h6 className="sm">Wordpress</h6>
										<p>다양한 시각화를 통해 여러분의 콘텐츠를 화려하게 만들어 드림</p>
									</div>
								</div>
							</div>
						</div> */}
					</div>
				</Container>
			</section>
		</div>
	);
}

export default LandingPage;
