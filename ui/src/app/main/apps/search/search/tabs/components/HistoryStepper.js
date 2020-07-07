import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Check from '@material-ui/icons/Check';
import Figures from './Figures';

const useQontoStepIconStyles = makeStyles(theme => ({
	root: {
		color: '#eaeaf0',
		display: 'flex',
		height: 22,
		alignItems: 'center'
	},
	active: {
		color: theme.palette.grey[500]
	},
	completed: {
		color: theme.palette.grey[500],
		zIndex: 1,
		fontSize: 18
	}
}));

function QontoStepIcon(props) {
	const classes = useQontoStepIconStyles();
	const { active } = props;

	return (
		<div
			className={clsx(classes.root, {
				[classes.active]: active
			})}
		>
			<Check className={classes.completed} />
		</div>
	);
}

QontoStepIcon.propTypes = {
	/**
	 * Whether this step is active.
	 */
	active: PropTypes.bool,
	/**
	 * Mark the step as completed. Is passed to child components.
	 */
	completed: PropTypes.bool
};

function HistoryStepper(props) {
	const { 출원일자, 공개일자, 등록일자, 소멸일자, 존속기간만료일자 } = props.search;
	const historyInfo = {
		출원: 출원일자,
		공개: 공개일자,
		등록: 등록일자,
		소멸: 소멸일자,
		존속기간만료: 소멸일자 === null ? 존속기간만료일자 : ''
	};
	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<div className="flex-col items-start p-12 py-0">
				<Typography className="p-12 text-14 font-bold">출원 히스토리</Typography>
				<Stepper activeStep={3}>
					{Object.entries(historyInfo)
						.filter(([_, value]) => value && value.length > 0)
						.map(([key, value]) => {
							const stepProps = {};
							const labelProps = {};
							labelProps.optional = (
								<Typography variant="caption" className="text-gray-400">
									{key}
								</Typography>
							);
							stepProps.completed = true;
							return (
								<Step key={key} {...stepProps}>
									<StepLabel StepIconComponent={QontoStepIcon} {...labelProps}>
										<div className="text-gray-500">{value.slice(-8)}</div>
									</StepLabel>
								</Step>
							);
						})}
				</Stepper>
			</div>
			<Typography className="text-14 px-16 py-8 font-bold">도면</Typography>
			<div className="px-16 py-8">
				<Figures className="mx-16 my-8" appNo={props.search.출원번호원본} />
			</div>
		</Paper>
	);
}

export default HistoryStepper;
