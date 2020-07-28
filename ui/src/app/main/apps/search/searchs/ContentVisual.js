import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

import WordCloud from './tabs/WordCloud';
import Classify from './tabs/Classify';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import IndicatorAnalysis from './tabs/IndicatorAnalysis';
import AppChart from './tabs/AppChart';
import IpcPie from './tabs/IpcPie';
import RelatedPersonPie from './tabs/RelatedPersonPie';

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
		flexGrow: 1,
		backgroundColor: theme.palette.background.paper
		// minHeight: 360
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

function ContentVisual(props) {
	const classes = useStyles();
	const { searchText, inventor, assignee } = props;
	const [tabValue, setTabValue] = useState(0);

	function handleChangeTab(event, tabValue) {
		setTabValue(tabValue);
	}

	const isEmpty = !!(!searchText && !inventor && !assignee);

	useEffect(() => {}, [props]);

	return (
		<div className={clsx(classes.root, 'w-full h-full rounded-8 shadow')}>
			<div className="flex flex-col">
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
					{/* <Hidden xsDown> */}
					{['지표분석', '워드클', '연도별', '기술별', '주체별', '인명별'].map((key, index) => (
						<Tab label={key} key={key} className={classes.tab} {...a11yProps(index)} />
					))}
					{/* </Hidden> */}

					{/* <Hidden smUp>
                    <Tab icon={<TextFieldsIcon />} {...a11yProps(1)} />
                    <Tab icon={<PhotoIcon />} {...a11yProps(2)} />
                    <Tab icon={<LayersIcon />} {...a11yProps(3)} />
                    <Tab icon={<ReceiptIcon />} {...a11yProps(4)} />
                    <Tab icon={<AssessmentIcon />} {...a11yProps(5)} />
                    <Tab icon={<AssessmentIcon />} {...a11yProps(6)} />
                </Hidden> */}
				</Tabs>
			</div>
			<TabPanel value={tabValue} index={0}>
				{tabValue === 0 &&
					(isEmpty ? (
						<EmptyMsg icon="assessment" msg="특허 지표분석" />
					) : (
						<IndicatorAnalysis searchText={searchText} />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={1}>
				{tabValue === 1 &&
					(isEmpty ? (
						<EmptyMsg icon="text_fields" msg="워드클라우드" />
					) : (
						<WordCloud searchText={searchText} />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={2}>
				{tabValue === 2 &&
					(isEmpty ? <EmptyMsg icon="photo" msg="연도별 출원건수" /> : <AppChart searchText={searchText} />)}
			</TabPanel>
			<TabPanel value={tabValue} index={3}>
				{tabValue === 3 &&
					(isEmpty ? <EmptyMsg icon="layers" msg="기술분야별 동향" /> : <IpcPie searchText={searchText} />)}
			</TabPanel>
			<TabPanel value={tabValue} index={4}>
				{tabValue === 4 &&
					(isEmpty ? (
						<EmptyMsg icon="receipt" msg="출원주체별 건수" />
					) : (
						<Classify searchText={searchText} />
					))}
			</TabPanel>
			<TabPanel value={tabValue} index={5}>
				{tabValue === 5 &&
					(isEmpty ? (
						<EmptyMsg icon="assessment" msg="인명정보 동향" />
					) : (
						<RelatedPersonPie searchText={searchText} />
					))}
			</TabPanel>
		</div>
	);
}

export default ContentVisual;
