import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { closeMatrixDialog } from 'app/main/apps/search/store/searchsSlice';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MatrixDialogTable from '../MatrixDialogTable';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

function MatrixDialog() {
	const dispatch = useDispatch();
	const matrixDialog = useSelector(({ abroadApp }) => abroadApp.searchs.matrixDialog);

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
				<DialogTitle>검색 결과 ({Number(matrixDialog.data.length).toLocaleString()})</DialogTitle>
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
