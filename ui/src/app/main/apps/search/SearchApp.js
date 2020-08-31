import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import clsx from 'clsx';
import withReducer from 'app/store/withReducer';
import reducer from './store';
import SearchAppSidebarContent from './SearchAppSidebarContent';
import SearchContent from './SearchContent';
import SearchContentToolbar from './SearchContentToolbar';

// const drawerWidth = 320;
// const headerHeight = 168;
// const toolbarHeight = 80;
// const headerContentHeight = headerHeight - toolbarHeight;

// const useStyles = makeStyles(theme => ({
// 	header: {
// 		height: headerContentHeight,
// 		minHeight: headerContentHeight,
// 		[theme.breakpoints.up('sm')]: {
// 			height: headerContentHeight + 8,
// 			minHeight: headerContentHeight + 8
// 		},
// 		alignItems: 'center'
// 	},
// 	topBg: {
// 		height: headerHeight
// 	},
// 	contentCard: {
// 		backgroundColor: theme.palette.background.default
// 	},
// 	toolbar: {
// 		height: toolbarHeight,
// 		minHeight: toolbarHeight
// 	},
// 	sidebar: {
// 		width: drawerWidth
// 	},
// 	sidebarHeader: {
// 		height: headerHeight,
// 		minHeight: headerHeight
// 	}
// }));

const useStyles = makeStyles(theme => ({
	header: {
		// backgroundColor: theme.palette.getContrastText(theme.palette.background.paper),
		height: 72,
		minHeight: 72
	},
	toolbar: {
		paddingTop: 8,
		paddingBottom: 0,
		paddingLeft: 16,
		paddingRight: 16,
		height: 72,
		minHeight: 72
	},
	content: {
		flex: '1 1 auto',
		height: '100%',
		overflow: 'auto',
		'-webkit-overflow-scrolling': 'touch'
	},
	contentCard: {
		display: 'flex',
		flex: '1 1 100%',
		height: '100%',
		flexDirection: 'column',
		// backgroundColor: theme.palette.background.paper,
		// boxShadow: theme.shadows[1],
		minHeight: 0
		// borderRadius: '8px 8px 0 0'
	}
}));

function SearchApp(props) {
	const classes = useStyles();
	const pageLayout = useRef(null);
	return (
		<FusePageSimple
			classes={{
				content: '',
				header: classes.header,
				leftSidebar: 'w-288 min-w-288'
			}}
			// header={<SearchContentToolbar pageLayout={pageLayout} />}
			// contentToolbar={<SearchHeader pageLayout={pageLayout} />}
			content={
				<div className={clsx(classes.contentCard, props.innerScroll && 'inner-scroll')}>
					{/* <div> */}
					<div className={classes.toolbar}>
						<SearchContentToolbar pageLayout={pageLayout} />
					</div>

					<FuseScrollbars className={classes.content} enable={true} scrollToTopOnRouteChange={true}>
						<SearchContent props={props} />
					</FuseScrollbars>
				</div>
			}
			// leftSidebarHeader={<SearchAppSidebarHeader />}
			leftSidebarContent={<SearchAppSidebarContent pageLayout={pageLayout} />}
			innerScroll
			ref={pageLayout}
		/>
	);
}
export default withReducer('searchApp', reducer)(SearchApp);
