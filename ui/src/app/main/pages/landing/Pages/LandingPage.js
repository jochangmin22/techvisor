import FuseAnimate from '@fuse/core/FuseAnimate';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
// import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
	root: {
		// background: `linear-gradient(to left, ${theme.palette.primary.dark} 0%, ${darken(theme.palette.primary.dark,0.5)} 100%)`,
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
			<FuseAnimate animation="transition.expandIn">
				<div className="absolute top-0 flex w-full max-w-620 md:max-w-3xl overflow-hidden">
					<div
						className={clsx(classes.leftSection, 'hidden md:flex flex-1 items-center justify-center p-64')}
					>
						<div className="max-w-512">
							<FuseAnimate animation="transition.slideUpIn" delay={1000}>
								<div className="flex w-full flex-col items-center justify-center">
									<Typography variant="h1" color="inherit" className="font-800 leading-tight">
										IP-GRIM
									</Typography>
									<Typography variant="h3" color="inherit" className="font-800 leading-tight">
										IP기반 기업분석 플랫폼
									</Typography>
								</div>
							</FuseAnimate>

							<FuseAnimate animation="transition.slideLeftIn" delay={1500}>
								<div className="flex w-full flex-col items-center justify-center mt-136">
									<Typography variant="h4" color="inherit">
										관심있는 주제의 기술 동향을
									</Typography>
									<Typography variant="h4" color="inherit">
										한눈에 파악할 수 있습니다.
									</Typography>
								</div>
							</FuseAnimate>
						</div>
					</div>
				</div>
			</FuseAnimate>
		</div>
	);
}

export default LandingPage;
