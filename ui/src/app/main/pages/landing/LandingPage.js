import FuseAnimate from '@fuse/core/FuseAnimate';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import React from 'react';
import MessageBox from './message-box';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'black',
		color: theme.palette.primary.contrastText
	},
	leftSection: {
		background: 'transparent'
	},
	rightSection: {
		background: `linear-gradient(to right, ${theme.palette.primary.dark} 0%, ${darken(
			theme.palette.primary.dark,
			0.5
		)} 100%)`,
		color: theme.palette.primary.contrastText
	},
	section: {
		paddingTop: 70,
		paddingBottom: 70,
		'& .section-title': {
			marginBottom: '52',
			'& h6': {
				color: '#ffae47',
				letterSpacing: '1.2rem',
				fontSize: 16
			},
			'& h1': {
				fontWeight: 700,
				color: '#000',
				fontSize: 42
			}
		},
		'& .section-title h6': {
			color: theme.palette.primary.light
		},
		'& .service-item': {
			padding: '48px 28px',
			position: 'relative',
			overflow: 'visible',
			transition: 'all .3s ease',
			'& img': {
				width: 55,
				height: 55,
				verticalAlign: 'middle'
			},
			'& .content h6': {
				fontSize: 16,
				fontWeight: 700,
				color: '#000',
				marginBottom: '20px',
				'& p': {
					lineHeight: '30px',
					marginBottom: '20px',
					fontSize: 16
				}
			}
			// '&::before': {
			// 	background: 'url("../../assets/images/icons/pattern.png")',
			// 	position: 'absolute',
			// 	top: 0,
			// 	left: 0,
			// 	content: '""',
			// 	width: '100%',
			// 	height: '100%',
			// 	transform: 'translate(20px,20px)',
			// 	opacity: 0,
			// 	zIndex: -1,
			// 	transition: 'all .6s ease'
			// }
		},
		'& [data-aos=text-reveal]': {
			clipPath: 'inset(0 100% 0 0)',
			'&.aos-animate': {
				position: 'relative',
				whiteSpace: 'nowrap',
				animationName: 'reveal-text',
				animationDuration: '1s',
				animationFillMode: 'both',
				animationTimingFunction: 'cubic-bezier(1, 0.01, 0, 1)',
				clipPath: 'inset(0 100% 0 0)',
				'&::after': {
					content: '""',
					position: 'absolute',
					zIndex: 999,
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: '#ffc275',
					transform: 'scaleX(0)',
					transformOrigin: '0 50%',
					animationDuration: '1s',
					animationFillMode: 'both',
					animationTimingFunction: 'cubic-bezier(1, 0.01, 0, 1)',
					animationName: 'revealer-text'
				}
			}
		}
	},
	'@global': {
		'@keyframes reveal-text': {
			from: { clipPath: 'inset(0 100% 0 0)' },
			to: { clipPath: 'inset(0 0 0 0)' }
		},
		'@keyframes revealer-text': {
			'0%,50%': { transformOrigin: '0 50%' },
			'51%,100%': { transformOrigin: '100% 50%' },
			'50%': { transform: 'scaleX(1)' },
			'100%': { transform: 'scaleX(0)' }
		}
	}
}));

function LandingPage() {
	const classes = useStyles();
	const videoSource = 'assets/videos/main_bg_video.mp4';

	AOS.init();

	return (
		<>
			<div
				className={clsx(
					classes.root,
					'flex flex-col flex-auto items-center justify-center flex-shrink-0 w-full h-screen'
				)}
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

				<div className="absolute top-0 flex w-full max-w-2xl md:max-w-3xl overflow-hidden">
					<div
						className={clsx(classes.leftSection, 'hidden md:flex flex-1 items-center justify-center p-64')}
					>
						<div className="max-w-lg">
							<FuseAnimate animation="transition.slideUpIn" delay={1000}>
								<div className="flex w-full flex-col items-center justify-center mb-136">
									<Typography variant="h1" color="inherit" className="font-800 leading-tight">
										Tech Visor
									</Typography>
									<Typography variant="h3" color="inherit" className="font-800 leading-tight">
										AI 기반 IP-비지니스 분석 플랫폼
									</Typography>
								</div>
							</FuseAnimate>

							<MessageBox />
							<div className="flex flex-row m-auto items-center justify-center mt-192">
								<Link
									role="button"
									to="/login"
									className="flex p-24 mr-24 w-288 rounded-lg cursor-pointer items-center justify-center bg-blue-600 hover:bg-blue-500 text-20"
								>
									시작하기 <Icon>arrow_forward</Icon>
								</Link>
								<a
									role="button"
									href="https://www.notion.so/jingu0705/060138803fe046d4a4d4eaab641ca06a"
									target="_blank"
									rel="noreferrer noopener"
								>
									<div className="flex p-24 w-288 rounded-lg cursor-pointer items-center justify-center hover:bg-blue-500 active:bg-blue-600 transition duration-300 ease-in-out border border-blue-400 hover:text-white text-20">
										더 알아보기 <Icon>arrow_forward</Icon>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<section className={clsx(classes.section)}>
				<div className="absolute inset-0 -z-1">
					<img
						src="http://demo.themefisher.com/icelab-hugo/images/shape-big.png"
						className="max-w-full h-auto align-middle"
						alt="big-shape"
					/>
				</div>
				<Container className="flex">
					<div className="flex flex-col">
						<div className="w-full h-auto">
							<div className="section-title">
								<h6 className="sm">
									<FuseAnimate animation="transition.slideUpIn" delay={1500}>
										<div>What We Do</div>
									</FuseAnimate>
								</h6>
								<h1>
									<FuseAnimate animation="transition.slideUpIn" delay={2000}>
										<div>
											기업, 기술에 대해
											<br />
											다양한 분석정보를 제공
										</div>
									</FuseAnimate>
								</h1>
							</div>
						</div>
						<div className="flex flex-row w-full">
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
						</div>
					</div>
				</Container>
			</section>
		</>
	);
}

export default LandingPage;
