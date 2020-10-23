import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import PropTypes from 'prop-types';
import { getOwnedPatent } from 'app/main/apps/company/store/searchsSlice';
import StockFairValue from '../StockFairValue/StockFairValue';
import WordCloudChart from '../WordCloud/WordCloudChart';
import ApplicationNumber from '../ApplicationNumber';
import IpcChart from '../Ipc/IpcChart';
import RelatedPerson from '../RelatedPerson';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<Typography
			component="div"
			role="tabpanel"
			className="w-full"
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			aria-labelledby={`vertical-tab-${index}`}
			{...other}
		>
			{value === index && <Box p={2}>{children}</Box>}
		</Typography>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

function a11yProps(index) {
	return {
		id: `vertical-tab-${index}`,
		'aria-controls': `vertical-tabpanel-${index}`
	};
}

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		backgroundColor: theme.palette.background.paper
	},
	tabs: {
		width: 90,
		[theme.breakpoints.down('md')]: {
			minWidth: 80
		},
		borderRight: `1px solid ${theme.palette.divider}`
	},
	tab: {
		minWidth: 90,
		[theme.breakpoints.down('md')]: {
			minWidth: 80
		},
		minHeight: 36,
		fontSize: '1.2rem'
	}
}));

function VisualContainer() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const selectedCorp = useSelector(({ companyApp }) => companyApp.searchs.selectedCorp);
	const [showLoading, setShowLoading] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	function handleChangeTab(event, tabValue) {
		setTabValue(tabValue);
	}

	useEffect(() => {
		setShowLoading(true);

		const params = {
			params: { corpName: selectedCorp.corpName || '' },
			subParams: {}
		};
		dispatch(getOwnedPatent(params)).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [selectedCorp.corpName]);

	const isEmpty = Object.values(selectedCorp).every(x => x === null || x === '');

	return (
		<div className={clsx(classes.root, 'w-full h-full rounded-8 shadow')}>
			<div className="flex flex-col h-full items-center content-between">
				<Typography variant="h6" className="hidden sm:flex ml-8 mt-16 mb-4">
					통계분석
				</Typography>
				<Tabs
					orientation="vertical"
					variant="scrollable"
					value={tabValue}
					onChange={handleChangeTab}
					className={classes.tabs}
				>
					{['적정주', '워드클', '연도별', '기술별', '인명별'].map((key, index) => (
						<Tab label={key} key={key} className={classes.tab} {...a11yProps(index)} />
					))}
				</Tabs>
				<DraggableIcon />
			</div>
			<TabPanel value={tabValue} index={0}>
				{tabValue === 0 &&
					(showLoading ? (
						<SpinLoading className="h-360" />
					) : isEmpty ? (
						<EmptyMsg icon="text_fields" msg="워드클라우드" />
					) : (
						<StockFairValue />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={1}>
				{tabValue === 1 &&
					(showLoading ? (
						<SpinLoading className="h-360" />
					) : isEmpty ? (
						<EmptyMsg icon="text_fields" msg="워드클라우드" />
					) : (
						<WordCloudChart />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={2}>
				{tabValue === 2 &&
					(showLoading ? (
						<SpinLoading className="h-360" />
					) : isEmpty ? (
						<EmptyMsg icon="photo" msg="연도별 출원건수" />
					) : (
						<ApplicationNumber />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={3}>
				{tabValue === 3 &&
					(showLoading ? (
						<SpinLoading className="h-360" />
					) : isEmpty ? (
						<EmptyMsg icon="layers" msg="기술분야별 동향" />
					) : (
						<IpcChart />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={4}>
				{tabValue === 4 &&
					(showLoading ? (
						<SpinLoading className="h-360" />
					) : isEmpty ? (
						<EmptyMsg icon="layers" msg="기술분야별 동향" />
					) : (
						<RelatedPerson />
					))}
			</TabPanel>
		</div>
	);
}

export default VisualContainer;
