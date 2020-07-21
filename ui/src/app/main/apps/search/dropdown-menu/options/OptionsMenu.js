import React, { useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
// import * as Actions from 'app/main/apps/search/store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import OptionsForm from './OptionsForm';

const useStyles = makeStyles({
	button: {
		cursor: 'text'
	}
});

function OptionsMenu(props) {
	const dispatch = useDispatch();

	const classes = useStyles(props);

	const optionsClickAwayOpen = useSelector(({ searchApp }) => searchApp.options.optionsClickAwayOpen);

	const [formOpen, setFormOpen] = useState(false);

	function handleFormOpen() {
		setFormOpen(true);
		document.addEventListener('keydown', escFunction, false);
	}

	function handleFormClose() {
		if (!formOpen) {
			return;
		}
		setFormOpen(false);
		document.removeEventListener('keydown', escFunction, false);
	}

	function handleCreate(note) {
		// dispatch(createNote(note));
		handleFormClose();
	}

	function escFunction(event) {
		if (event.keyCode === 27) {
			handleFormClose();
		}
	}

	function handleClickAway(ev) {
		const preventCloseElements = document.querySelector('.prevent-add-close');
		const preventClose = preventCloseElements ? preventCloseElements.contains(ev.target) : false;
		if (preventClose) {
			return;
		}
		handleFormClose();
	}

	return (
		<ClickAwayListener onClickAway={handleClickAway}>
			<Paper
				className={clsx(
					classes.button,
					optionsClickAwayOpen ? '' : 'hidden',
					'flex items-center mx-1 my-6 min-h-48'
					// "flex items-center w-full max-w-512 mt-8 mb-16 min-h-48"
				)}
				elevation={1} // shadow dept
			>
				<OptionsForm />
			</Paper>
		</ClickAwayListener>
	);
}

export default OptionsMenu;
