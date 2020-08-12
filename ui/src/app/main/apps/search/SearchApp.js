import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import reducer from './store';
import SearchHeader from './SearchHeader';
import SearchAppSidebarHeader from './SearchAppSidebarHeader';
import SearchAppSidebarContent from './SearchAppSidebarContent';
import SearchContent from './SearchContent';

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

function SearchApp(props) {
	const classes = useStyles();
	const pageLayout = useRef(null);
	const [isLeftSidebar] = useState(true);

	return isLeftSidebar ? (
		<FusePageCarded
			classes={{
				// root: classes.layoutRoot,
				header: classes.header,
				topBg: classes.topBg,
				toolbar: classes.toolbar,
				// content: "min-h-92 h-92"
				sidebar: classes.sidebar,
				contentCard: classes.contentCard,
				sidebarHeader: classes.sidebarHeader
			}}
			header={<SearchHeader pageLayout={pageLayout} />}
			content={<SearchContent props={props} />}
			leftSidebarHeader={<SearchAppSidebarHeader />}
			leftSidebarContent={<SearchAppSidebarContent pageLayout={pageLayout} />}
			innerScroll
			ref={pageLayout}
		/>
	) : (
		<FusePageCarded
			classes={{
				header: classes.header,
				topBg: classes.topBg,
				toolbar: classes.toolbar,
				sidebar: classes.sidebar,
				contentCard: classes.contentCard,
				sidebarHeader: classes.sidebarHeader
			}}
			header={<SearchHeader pageLayout={pageLayout} />}
			content={<SearchContent props={props} />}
			ref={pageLayout}
			innerScroll
		/>
	);
}
export default withReducer('searchApp', reducer)(SearchApp);
