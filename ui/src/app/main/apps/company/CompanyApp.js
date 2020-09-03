import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import clsx from 'clsx';
import withReducer from 'app/store/withReducer';
import reducer from './store';
import CompanyAppSidebarContent from './CompanyAppSidebarContent';
import CompanyAppSidebarHeader from './CompanyAppSidebarHeader';
import CompanyContent from './CompanyContent';
import CompanyContentToolbar from './CompanyContentToolbar';

const useStyles = makeStyles(theme => ({
	header: {
		height: 72,
		minHeight: 72
	},
	toolbar: {
		backgroundColor: theme.palette.primary.dark,
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
		minHeight: 0
	}
}));

function CompanyApp(props) {
	const classes = useStyles();
	const pageLayout = useRef(null);
	return (
		<FusePageSimple
			classes={{
				content: '',
				header: classes.header,
				leftSidebar: 'w-288 min-w-288 border-r-0',
				sidebarHeader: 'h-72 min-h-72 border-r-0'
			}}
			content={
				<div className={clsx(classes.contentCard, props.innerScroll && 'inner-scroll')}>
					<div className={classes.toolbar}>
						<CompanyContentToolbar pageLayout={pageLayout} />
					</div>

					<FuseScrollbars className={classes.content} enable={true} scrollToTopOnRouteChange={true}>
						<CompanyContent props={props} />
					</FuseScrollbars>
				</div>
			}
			leftSidebarHeader={<CompanyAppSidebarHeader />}
			leftSidebarContent={<CompanyAppSidebarContent pageLayout={pageLayout} />}
			innerScroll
			ref={pageLayout}
		/>
	);
}
export default withReducer('companyApp', reducer)(CompanyApp);
