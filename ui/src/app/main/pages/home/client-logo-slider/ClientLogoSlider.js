import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const clientLogos = [
	{
		name: 'client-logo',
		src: 'http://demo.themefisher.com/redlab-hugo/images/clients-logo/clients-logo-1.png'
	},
	{
		name: 'client-logo',
		src: 'http://demo.themefisher.com/redlab-hugo/images/clients-logo/clients-logo-2.png'
	},
	{
		name: 'client-logo',
		src: 'http://demo.themefisher.com/redlab-hugo/images/clients-logo/clients-logo-3.png'
	},
	{
		name: 'client-logo',
		src: 'http://demo.themefisher.com/redlab-hugo/images/clients-logo/clients-logo-4.png'
	},
	{
		name: 'client-logo',
		src: 'http://demo.themefisher.com/redlab-hugo/images/clients-logo/clients-logo-5.png'
	}
];

const useStyles = makeStyles(theme => ({
	root: {
		maxWidth: 400,
		flexGrow: 1
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		height: 50,
		paddingLeft: theme.spacing(4),
		backgroundColor: theme.palette.background.default
	},
	img: {
		maxWidth: '100%',
		height: 'auto',
		display: 'unset',
		filter: 'grayscale(100%)',
		transition: '.2s ease'
	}
}));

function ClientLogoSlider() {
	const classes = useStyles();
	const theme = useTheme();
	const [activeStep, setActiveStep] = React.useState(0);

	const handleStepChange = step => {
		setActiveStep(step);
	};

	return (
		<div className={classes.root}>
			<AutoPlaySwipeableViews
				axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
				index={activeStep}
				onChangeIndex={handleStepChange}
				enableMouseEvents
			>
				{clientLogos.map((step, index) => (
					<div key={index}>
						{Math.abs(activeStep - index) <= 2 ? (
							<img className={classes.img} src={step.src} alt={step.name} />
						) : null}
					</div>
				))}
			</AutoPlaySwipeableViews>
		</div>
	);
}

export default ClientLogoSlider;
