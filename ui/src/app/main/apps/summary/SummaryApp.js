import React, { useEffect, useRef } from 'react';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { useDispatch } from 'react-redux';
import withReducer from 'app/store/withReducer';
import { makeStyles } from '@material-ui/core/styles';
import SummaryList from './SummaryList';
import SummaryHeader from './SummaryHeader';
import SummarySidebarContent from './SummarySidebarContent';
import SummaryDialog from './SummaryDialog';
import { openNewSummaryDialog } from './store/summarySlice';
import reducer from './store';

const useStyles = makeStyles({
	addButton: {
		position: 'absolute',
		right: 12,
		bottom: 12,
		zIndex: 99
	}
});

function SummaryApp(props) {
	const dispatch = useDispatch();

	const classes = useStyles(props);
	const pageLayout = useRef(null);

	useEffect(() => {
		// dispatch(getSummary(props.match.params));
		// dispatch(getUserData());
	}, [dispatch, props.match.params]);

	useEffect(() => {
		// dispatch(getSummary(props.match.params));
	}, [dispatch, props.match.params]);

	return (
		<>
			<FusePageSimple
				classes={{
					contentWrapper: 'p-0 sm:p-24 pb-80 sm:pb-80 h-full',
					content: 'flex flex-col h-full',
					leftSidebar: 'w-256 border-0',
					header: 'min-h-224 h-224 sm:h-320 sm:min-h-320'
				}}
				header={<SummaryHeader pageLayout={pageLayout} />}
				content={<SummaryList />}
				leftSidebarContent={<SummarySidebarContent />}
				sidebarInner
				ref={pageLayout}
				innerScroll
			/>
			<FuseAnimate animation="transition.expandIn" delay={300}>
				<Fab
					color="primary"
					aria-label="add"
					className={classes.addButton}
					onClick={ev => dispatch(openNewSummaryDialog())}
				>
					<Icon>person_add</Icon>
				</Fab>
			</FuseAnimate>
			<SummaryDialog />
		</>
	);
}

export default withReducer('summaryApp', reducer)(SummaryApp);
