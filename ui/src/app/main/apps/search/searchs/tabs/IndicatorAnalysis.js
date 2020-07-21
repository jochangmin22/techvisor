import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import IndicatorTable from './components/IndicatorTable';
import CrossAnalysisA from './components/CrossAnalysisA';
import CrossAnalysisB from './components/CrossAnalysisB';

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
			{value === index && <Box>{children}</Box>}
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
		flexGrow: 1
	},
	tabs: {
		width: 238,
		[theme.breakpoints.up('sm')]: {
			minWidth: 386
		},
		[theme.breakpoints.up('md')]: {
			minWidth: 300
		},
		[theme.breakpoints.up('lg')]: {
			minWidth: 412
		}
	},
	tab: {
		minWidth: 70,
		minHeight: 26,
		fontSize: '1.2rem'
	}
}));

function IndicatorAnalysis(props) {
	const classes = useStyles();
	const { searchText, inventor, assignee } = props;
	const [tabValue, setTabValue] = useState(0);
	const [selectedCategory, setSelectedCategory] = useState('출원인별');

	function handleChangeTab(event, tabValue) {
		setTabValue(tabValue);
	}

	function handleSelectedCategory(event) {
		setSelectedCategory(event.target.value);
	}

	const isEmpty = !!(!searchText && !inventor && !assignee);

	useEffect(() => {}, [props]);

	return (
		<div className={clsx(classes.root, 'flex flex-col w-full h-full')}>
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8">
				<FormControl>
					<Select
						className="w-128 px-12"
						value={selectedCategory}
						onChange={handleSelectedCategory}
						displayEmpty
					>
						{['출원인별', '국가별', '특허기관별', '연도별'].map(key => (
							<MenuItem value={key} key={key}>
								{key}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<Tabs
					orientation="horizontal"
					variant="scrollable"
					value={tabValue}
					onChange={handleChangeTab}
					className={classes.tabs}
				>
					<Tab label="교차분석 I" className={classes.tab} {...a11yProps(0)} />
					<Tab label="교차분석 II" className={classes.tab} {...a11yProps(1)} />
					<Tab label="종합" className={classes.tab} {...a11yProps(2)} />
					{/* <Tab label="TS" className={classes.tab} {...a11yProps(3)} /> */}
					{/* <Tab label="PFS" className={classes.tab} {...a11yProps(4)} /> */}
				</Tabs>
			</div>
			<TabPanel value={tabValue} index={0}>
				{tabValue === 0 &&
					(isEmpty ? (
						<EmptyMsg icon="photo" msg="CPP, PII, TS 및 PFS 교차분석" />
					) : (
						<div className="flex w-full">
							<CrossAnalysisA searchText={searchText} />
						</div>
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={1}>
				{tabValue === 1 &&
					(isEmpty ? (
						<EmptyMsg icon="layers" msg="피인용도지수(CPP)-시장확보지수(PFS) 교차분석" />
					) : (
						<div className="flex w-full">
							<CrossAnalysisB searchText={searchText} />
						</div>
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={2}>
				{tabValue === 2 &&
					(isEmpty ? (
						<EmptyMsg icon="text_fields" msg="지표분석 종합" />
					) : (
						<IndicatorTable searchText={searchText} />
					))}
			</TabPanel>
			{/* <TabPanel value={tabValue} index={3}>
				{tabValue === 3 && (isEmpty ? <EmptyMsg icon="receipt" msg="TS" /> : <Ts searchText={searchText} />)}
			</TabPanel>
			<TabPanel value={tabValue} index={4}>
				{tabValue === 4 &&
					(isEmpty ? <EmptyMsg icon="assessment" msg="PFS" /> : <Pfs searchText={searchText} />)}
			</TabPanel> */}
		</div>
	);
}

export default IndicatorAnalysis;
