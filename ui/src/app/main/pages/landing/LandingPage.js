import FuseAnimate from '@fuse/core/FuseAnimate';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import clsx from 'clsx';
import React from 'react';
import MessageBox from './message-box';
// import TextStepper from './text-stepper';

// import { Link } from 'react-router-dom';

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
	}
}));

function LandingPage() {
	const classes = useStyles();
	const videoSource = 'assets/videos/main_bg_video.mp4';

	return (
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
				<div className={clsx(classes.leftSection, 'hidden md:flex flex-1 items-center justify-center p-64')}>
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
						{/* <TextStepper /> */}
						<div className="m-auto rounded-32 cursor-pointer text-center w-xs items-center justify-center bg-blue-600 hover:bg-blue-500 text-20 mt-192 p-28">
							Tech Visor 시작하기 <Icon>arrow_forward</Icon>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LandingPage;
