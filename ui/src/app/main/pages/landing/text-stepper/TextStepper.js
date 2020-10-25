import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const tutorialSteps = [
	{
		textA: '방대한 양의 특허를 빠르게 분석하여',
		textB: '내가 원하는 주제의 기술트렌드를',
		textC: '간편하게 확인할 수 있습니다.'
	},
	{
		textA: '관심 키워드 입력만으로',
		textB: '관련 기업을 찾고',
		textC: '해당 기업의 R&D역량을 파악하세요.'
	},
	{
		textA: '아직도 개별종목의 적정주가를 일일히 계산하시나요?',
		textB: 'Tech-Visor는 상장된 모든 기업의 재무분석을 통해',
		textC: '매일매일 변화하는 적정주가를 분석하여 제공합니다.'
	},
	{
		textA: '관심 기업을 나만의 포트폴리오에 담아',
		textB: '뉴스, 공시, 임상, 특허정보를 빠르게 확인하여',
		textC: '투자의사결정에 활용할 수 있습니다.'
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
		height: 255,
		display: 'block',
		maxWidth: 400,
		overflow: 'hidden',
		width: '100%'
	}
}));

function SwipeableTextMobileStepper() {
	const classes = useStyles();
	const theme = useTheme();
	const [activeStep, setActiveStep] = React.useState(0);
	const maxSteps = tutorialSteps.length;

	const handleNext = () => {
		setActiveStep(prevActiveStep => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep(prevActiveStep => prevActiveStep - 1);
	};

	const handleStepChange = step => {
		setActiveStep(step);
	};

	return (
		<div className="w-full">
			<AutoPlaySwipeableViews
				axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
				index={activeStep}
				onChangeIndex={handleStepChange}
				animateTransitions={false}
				interval={8000}
				enableMouseEvents
			>
				{tutorialSteps.map((step, index) => (
					<div key={index} className="flex w-full flex-col items-center justify-center mt-136">
						{Math.abs(activeStep - index) <= 2 ? (
							<Typography variant="h5" color="inherit" className="text-center leading-loose">
								<p>{step.textA}</p>
								<p>{step.textB}</p>
								<p>{step.textC}</p>
							</Typography>
						) : null}
					</div>
				))}
			</AutoPlaySwipeableViews>
			<MobileStepper
				steps={maxSteps}
				position="static"
				variant="dots"
				activeStep={activeStep}
				classes={{
					dot: 'min-w-16 min-h-16 rounded-4 bg-white cursor-pointer',
					dotActive: 'bg-blue-500'
				}}
				className="bg-transparent"
				nextButton={
					<Button onClick={handleNext} disabled={activeStep === maxSteps - 1} className="text-white">
						{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
					</Button>
				}
				backButton={
					<Button onClick={handleBack} disabled={activeStep === 0} className="text-white">
						{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
					</Button>
				}
			/>
		</div>
	);
}

export default SwipeableTextMobileStepper;
