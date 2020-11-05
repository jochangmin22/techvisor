import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeSearchPageDialog } from 'app/main/apps/search/store/searchsSlice';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import { CgArrowsExpandRight } from 'react-icons/cg';
import { IconContext } from 'react-icons';
import Tooltip from '@material-ui/core/Tooltip';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, makeStyles } from '@material-ui/core/styles';
// import { Link } from 'react-router-dom';
import SearchPage from '../SearchPage';

const useStyles = makeStyles(theme => ({
	dialogPaper: {
		minHeight: '90vh',
		maxHeight: '90vh'
	}
}));

function SearchPageDialog() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const searchPageDialog = useSelector(({ searchApp }) => searchApp.searchs.searchPageDialog);
	const theme = useTheme();
	const [fullScreen, setFullScreen] = useState(useMediaQuery(theme.breakpoints.down('sm')));

	function closeDialog() {
		dispatch(closeSearchPageDialog());
	}

	return (
		<Dialog
			classes={{ paper: classes.dialogPaper }}
			{...searchPageDialog.props}
			fullScreen={fullScreen}
			onClose={closeDialog}
			fullWidth
			maxWidth={false}
		>
			<DialogActions className="justify-between p-8 h-52">
				<DialogTitle>
					<Tooltip title="Navigate to this page" placement="top">
						<Button
							// component={Link}
							// to="#none"
							onClick={() => setFullScreen(!fullScreen)}
							className="flex flex-row items-center justify-center"
						>
							<IconContext.Provider value={{ size: '0.8em', className: 'text-gray-400' }}>
								<CgArrowsExpandRight />
							</IconContext.Provider>
							<div className="ml-8 text-gray-400 font-medium text-12">Open wide</div>
						</Button>
					</Tooltip>
				</DialogTitle>
				<IconButton onClick={closeDialog}>
					<Icon>close</Icon>
				</IconButton>
			</DialogActions>
			<DialogContent>
				<SearchPage />
			</DialogContent>
		</Dialog>
	);
}

export default SearchPageDialog;
