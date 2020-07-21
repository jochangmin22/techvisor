import React, { useEffect, useState } from 'react';
// import Dialog from '@material-ui/core/Dialog';
import ListItem from '@material-ui/core/ListItem';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import List from '@material-ui/core/List';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { useForm } from '@fuse/hooks';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import _ from '@lodash';
import * as Actions from 'app/main/apps/search/store/actions';
import { makeStyles } from '@material-ui/core/styles';
import ThsrsForm from './ThsrsForm';

const defaultFormState = {
	name: '',
	data: []
};

const useStyles = makeStyles({
	button: {
		cursor: 'text'
	}
});

function ThsrsMenu(props) {
	const dispatch = useDispatch();

	const classes = useStyles(props);

	const thsrsClickAwayOpen = useSelector(({ searchApp }) => searchApp.thsrs.thsrsClickAwayOpen);

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

	const thsrs = useSelector(({ searchApp }) => searchApp.thsrs.data);

	const [thsrsForm, setThsrsForm] = useState(thsrs);
	const { form: newThsrsForm, handleChange, resetForm } = useForm(defaultFormState);

	useEffect(() => {
		setThsrsForm(thsrs);
	}, [thsrs]);

	function isFormInValid() {
		return newThsrsForm.name === '';
	}

	function handleSubmit(ev) {
		ev.preventDefault();
		if (isFormInValid()) {
			return;
		}
		dispatch(getThsrs(newThsrsForm.name));
		// const newThsrs = new ThsrsModel(newThsrsForm);
		// setThsrsForm(_.setIn(thsrsForm, newThsrs.id, newThsrs));
		resetForm();
	}

	return (
		<ClickAwayListener onClickAway={handleClickAway}>
			<Paper
				className={clsx(
					classes.button,
					thsrsClickAwayOpen ? '' : 'hidden',
					'flex items-center w-4/5 wr-auto m-6 min-h-48'
					// "w-full max-w-640 p-12 m-14 rounded-8"
					// "flex items-center w-full max-w-512 mt-8 mb-16 min-h-48"
				)}
				elevation={1}
			>
				<List dense>
					<form onSubmit={handleSubmit}>
						<ListItem className="p-0 mb-16" dense>
							<Icon color="action">search</Icon>
							<Input
								className="mx-8 w-sm"
								name="name"
								autoComplete="off"
								value={newThsrsForm.name}
								onChange={handleChange}
								placeholder="검색할 키워드를 하나만 입력해주십시오."
							/>
							<IconButton
								className="w-32 h-32 mx-4 p-0"
								aria-label="Delete"
								disabled={isFormInValid()}
								type="submit"
							>
								<Icon fontSize="small">check</Icon>
							</IconButton>
							<IconButton
								className="w-32 h-32 mx-4 p-0"
								aria-label="close"
								onClick={ev => dispatch(toggleThsrsClickAway(thsrsClickAwayOpen))}
							>
								<Icon fontSize="small">close</Icon>
							</IconButton>
						</ListItem>
					</form>
					<ThsrsForm />
				</List>
			</Paper>
		</ClickAwayListener>
	);
}

export default ThsrsMenu;
