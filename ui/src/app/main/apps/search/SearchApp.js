import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FusePageCarded from '@fuse/core/FusePageCarded';
import withReducer from 'app/store/withReducer';
import reducer from './store/reducers';

import SearchHeader from './SearchHeader';
// import SearchToolbar from "./SearchToolbar";
import SearchAppSidebarHeader from './SearchAppSidebarHeader';
import SearchAppSidebarContent from './SearchAppSidebarContent';
import SearchContent from './SearchContent';
// import DrawerMain from "./searchs/DrawerMain";
// import PersistentDrawerLeft from "./SearchContent";
// import ThsrsMenu from "./dropdown-menu/thsrs/ThsrsMenu";
// import OptionsMenu from "./dropdown-menu/options/OptionsMenu";
// import ApplicantMenu from './dropdown-menu/applicant/ApplicantMenu';

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
	// layoutRoot: {},
	// layoutHeader: {
	//     height: 79,
	//     minHeight: 79,
	//     backgroundColor: "#FFFFFF",
	//     background: "rgba(0, 0, 0, 0.45)",
	//     [theme.breakpoints.down("md")]: {
	//         height: 200,
	//         minHeight: 200
	//     }
	// }
}));

function SearchApp(props) {
	const classes = useStyles();
	const pageLayout = useRef(null);
	const [isLeftSidebar] = useState(true);

	// useEffect(() => {
	//     dispatch(Actions.getThsrs(props.match.params));
	// }, [dispatch, props.match.params]);

	// useEffect(() => {}, [isLeftSidebar]);

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
			content={
				<>
					{/* <ThsrsMenu /> */}
					{/* <ApplicantMenu /> */}
					{/* <OptionsMenu /> */}
					{/* <ContentToolbar pageLayout={pageLayout} /> */}
					{/* <PersistentDrawerLeft pageLayout={pageLayout} /> */}
					<SearchContent props={props} />
					{/* <DrawerMain props={props} /> */}
					{/* <SearchContent props={props} /> */}
				</>
			}
			leftSidebarHeader={<SearchAppSidebarHeader />}
			leftSidebarContent={<SearchAppSidebarContent pageLayout={pageLayout} />}
			// header={<SearchHeader pageLayout={pageLayout} />}
			// contentToolbar={<ContentToolbar pageLayout={pageLayout} />}
			// contentToolbar={<SearchToolbar props={props} />}

			// leftSidebarContent={<LeftQuickPanel />}
			// sidebarInner
			ref={pageLayout}
			innerScroll
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
			content={
				<>
					{/* <ApplicantMenu /> */}
					<SearchContent props={props} />
				</>
			}
			ref={pageLayout}
			innerScroll
		/>
	);
}
export default withReducer('searchApp', reducer)(SearchApp);
