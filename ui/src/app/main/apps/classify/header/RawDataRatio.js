import React, { useState, useEffect } from 'react';
import _ from '@lodash';
import { Line } from 'rc-progress';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
// import ExpansionPanelActions from "@material-ui/core/ExpansionPanelActions";
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	root: {
		// width: "w-lg"
	},
	expansionPanel: {
		rounded: false
	},
	heading: {
		fontSize: theme.typography.pxToRem(15)
	},
	secondaryHeading: {
		fontSize: theme.typography.pxToRem(15),
		color: theme.palette.text.secondary
	},
	primaryHeading: {
		fontSize: theme.typography.pxToRem(15),
		color: theme.palette.text.primary
	},
	icon: {
		verticalAlign: 'bottom',
		height: 20,
		width: 20
	},
	details: {
		alignItems: 'center'
	},
	column: {
		flexBasis: '33.33%'
	},
	helper: {
		borderLeft: `2px solid ${theme.palette.divider}`,
		padding: theme.spacing(1, 2)
	},
	link: {
		color: theme.palette.text.primary,
		textDecoration: 'none',
		'&:hover': {
			textDecoration: 'underline'
		}
	}
}));

const colorMap = ['#6CABD4', '#387CA3', '#005074', '#89F6CF'];

function RawDataRatio(props) {
	const classes = useStyles();
	const [filteredData, setFilteredData] = useState();

	useEffect(() => {
		function getStats(arr) {
			var a = _.chain(arr)
				.filter(item => !!item.ipc요약)
				.groupBy('ipc요약')
				.map((value, key) => ({ labels: key, data: value.length }))
				.orderBy(['data'], ['desc'])
				.splice(0, 4)
				.reduce((re, { labels, data }) => {
					if (!re['labels']) re['labels'] = [];
					if (!re['data']) re['data'] = [];
					// if (!re["count"]) re["count"] = 0;
					re['labels'].push(labels);
					re['data'].push(data);
					// re["count"] += data;
					return re;
				}, {})
				.value();

			a = _.isEmpty(a) ? { labels: [], data: [] } : a;

			return a;
		}

		if (props.data && props.data.length > 0) {
			setFilteredData(getStats(props.data));
		}
	}, [props.data]);

	if (!filteredData || filteredData.length === 0) {
		return <div />;
	}

	return (
		<div className={classes.root}>
			{/* <ExpansionPanel defaultExpanded> */}
			<ExpansionPanel className={classes.expansionPanel}>
				<ExpansionPanelSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1c-content"
					id="panel1c-header"
				>
					<div className={classes.column}>
						<Typography
							className={clsx(classes.heading, 'inline px-8 py-4 rounded truncate bg-blue text-white')}
						>
							{props.data.length.toLocaleString() + ' 건'}
						</Typography>
					</div>
					<div className={classes.column}>
						<div className={classes.secondaryHeading}>
							<span className={classes.primaryHeading}>{filteredData.labels[0]}</span>{' '}
							{((filteredData.data[0] / props.data.length) * 100).toFixed(1)}%{' '}
							{filteredData.data[0].toLocaleString()} 건
						</div>
						<Line
							percent={((filteredData.data[0] / props.data.length) * 100).toFixed(0)}
							strokeWidth="4"
							strokeColor={colorMap[0]}
						/>
					</div>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails className={classes.details}>
					{filteredData.labels.map(
						(label, index) =>
							index > 0 && (
								<div className={classes.column} key={index}>
									<div className={classes.secondaryHeading}>
										<span className={classes.primaryHeading}>{filteredData.labels[index]}</span>{' '}
										{((filteredData.data[index] / props.data.length) * 100).toFixed(1)}%{' '}
										{filteredData.data[index].toLocaleString()} 건
									</div>
									<Line
										percent={((filteredData.data[index] / props.data.length) * 100).toFixed(0)}
										strokeWidth="4"
										strokeColor={colorMap[index]}
									/>
								</div>
							)
					)}

					<div className={clsx(classes.column, classes.helper)}>
						<Typography variant="caption">
							주요 IPC 분포입니다.
							<br />
							<a href="#secondary-heading-and-columns" className={classes.link}>
								Learn more
							</a>
						</Typography>
					</div>
				</ExpansionPanelDetails>
				{/* <Divider />
                <ExpansionPanelActions>
                    <Button size="small">Cancel</Button>
                    <Button size="small" color="primary">
                        Save
                    </Button>
                </ExpansionPanelActions> */}
			</ExpansionPanel>
		</div>
		// <div className="w-72">
		//     <Line
		//         percent={[
		//             (row.value * 100).toFixed(0),
		//             100 - (row.value * 100).toFixed(0)
		//         ]}
		//         strokeWidth="8"
		//         strokeColor={["#3D95E5", "#EE5A52"]}
		//     />
		// </div>
	);
}

export default React.memo(RawDataRatio);
