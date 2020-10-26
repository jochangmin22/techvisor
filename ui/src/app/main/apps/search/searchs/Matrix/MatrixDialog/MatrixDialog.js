import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { closeMatrixDialog } from 'app/main/apps/search/store/searchsSlice';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MatrixDialogTable from '../MatrixDialogTable';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles(theme => ({
	root: { backgroundColor: theme.palette.primary.dark }
}));

function MatrixDialog() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const matrixDialog = useSelector(({ searchApp }) => searchApp.searchs.matrixDialog);

	const initDialog = useCallback(() => {
		if (matrixDialog.data) {
		}
	}, [matrixDialog.data]);

	useEffect(() => {
		if (matrixDialog.props.open) {
			initDialog();
		}
	}, [matrixDialog.props.open, initDialog]);

	function closeDialog() {
		dispatch(closeMatrixDialog());
	}

	if (!matrixDialog.data) {
		return '';
	}

	return (
		<Dialog classes={{ paper: 'm-24' }} {...matrixDialog.props} onClose={closeDialog} fullWidth maxWidth="lg">
			<DialogActions className="justify-between p-8 h-52">
				<DialogTitle>
					<Typography className={clsx(classes.root, 'text-13 font-400 rounded-4 text-white px-8 py-4 mr-8')}>
						검색 결과 {Number(matrixDialog.data.length).toLocaleString()} 건
					</Typography>
				</DialogTitle>
				<IconButton onClick={closeDialog}>
					<Icon>close</Icon>
				</IconButton>
			</DialogActions>
			<DialogContent>
				<MatrixDialogTable />
			</DialogContent>
		</Dialog>
	);
}

export default MatrixDialog;
