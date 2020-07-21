import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from './store/actions';
// import clsx from "clsx";
import { makeStyles } from '@material-ui/core/styles';
import {
	// Drawer,
	// CssBaseline,
	AppBar,
	Toolbar,
	// Typography,
	// Divider,
	// IconButton,
	Tab,
	Tabs
} from '@material-ui/core';

// import MenuIcon from "@material-ui/icons/Menu";
// import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
// import ChevronRightIcon from "@material-ui/icons/ChevronRight";

// import DrawerLeft from "./searchs/DrawerLeft";
// import LeftSiderTerms from "./searchs/leftSiderTerms";
// import DrawerMain from "./searchs/DrawerMain";
import MidToolbar from './searchs/MidToolbar';

// import { authRoles } from "app/auth";

// const drawerWidth = 288;

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex'
	},
	appBar: {
		// top: "auto",
		backgroundColor: 'white',
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	tabRoot: {
		minWidth: 128,
		fontSize: 14,
		fontWeight: 600
	},
	content: {
		flexGrow: 1,
		paddingTop: theme.spacing(10),
		paddingBottom: theme.spacing(0),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		marginLeft: 0
	}
}));

export default function SearchToolbar(props) {
	const classes = useStyles();
	const dispatch = useDispatch();

	const total = useSelector(({ searchApp }) => searchApp.searchs.entities.length);

	const selectedTab = useSelector(({ searchApp }) => searchApp.searchs.selectedTab);

	// const [selectedTab, setSelectedTab] = useState(0);

	function handleTabChange(event, value) {
		// setSelectedTab(value);
		dispatch(setSelectedTab(value));
	}

	return (
		<div className={classes.root}>
			<AppBar position="absolute" className={classes.appBar}>
				<Toolbar variant="dense">
					<Tabs
						value={selectedTab}
						onChange={handleTabChange}
						indicatorColor="secondary"
						textColor="secondary"
						variant="scrollable"
						scrollButtons="off"
						classes={{
							root: 'w-full border-b-1'
						}}
					>
						<Tab className={classes.tabRoot} label="검색결과" />
						<Tab className={classes.tabRoot} label="워드클라우드" />
						<Tab className={classes.tabRoot} label="연도별흐름" />
						<Tab className={classes.tabRoot} label="분야별흐름" />
						<Tab className={classes.tabRoot} label="기관별흐름" />
						<Tab className={classes.tabRoot} label="상위출원인" />
						<Tab className={classes.tabRoot} label="상위연구자" />
						<Tab className={classes.tabRoot} label="주제차트" />
						{/* <Tab className={classes.tabRoot} label="번역" /> */}
					</Tabs>
				</Toolbar>
				<MidToolbar total={total} className="block absolute" />
			</AppBar>
		</div>
	);
}
