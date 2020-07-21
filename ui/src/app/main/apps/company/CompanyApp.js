import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import reducer from './store';

import CompanyHeader from './CompanyHeader';
import CompanyAppSidebarHeader from './CompanyAppSidebarHeader';
import CompanyAppSidebarContent from './CompanyAppSidebarContent';
import CompanyContent from './CompanyContent';

const drawerWidth = 320;
const headerHeight = 168;
const toolbarHeight = 80;
const headerContentHeight = headerHeight - toolbarHeight;

const useStyles = makeStyles(theme => ({
	header: {
		height: headerContentHeight,
		minHeight: headerContentHeight,
		[theme.breakpoints.up('sm')]: {
			height: headerContentHeight + 8,
			minHeight: headerContentHeight + 8
		},
		alignItems: 'center'
	},
	topBg: {
		height: headerHeight
	},
	contentCard: {
		backgroundColor: theme.palette.background.default
	},
	toolbar: {
		height: toolbarHeight,
		minHeight: toolbarHeight
	},
	sidebar: {
		width: drawerWidth
	},
	sidebarHeader: {
		height: headerHeight,
		minHeight: headerHeight
	}
}));

function CompanyApp(props) {
	const classes = useStyles();
	const pageLayout = useRef(null);

	return (
		<FusePageCarded
			classes={{
				header: classes.header,
				topBg: classes.topBg,
				toolbar: classes.toolbar,
				sidebar: classes.sidebar,
				contentCard: classes.contentCard,
				sidebarHeader: classes.sidebarHeader
			}}
			header={<CompanyHeader pageLayout={pageLayout} />}
			content={<CompanyContent props={props} />}
			leftSidebarHeader={<CompanyAppSidebarHeader />}
			leftSidebarContent={<CompanyAppSidebarContent pageLayout={pageLayout} />}
			ref={pageLayout}
			innerScroll
		/>
	);
}
export default withReducer('companyApp', reducer)(CompanyApp);
