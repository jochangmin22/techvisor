import React, { useEffect, useCallback } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import { useForm } from '@fuse/hooks';
import FuseUtils from '@fuse/utils/FuseUtils';
import { useDispatch, useSelector } from 'react-redux';
import {
	closeEditClassifyDialog,
	closeNewClassifyDialog,
	addClassify,
	updateClassify,
	removeClassify
} from './store/classifySlice';

const defaultFormState = {
	id: '',
	name: '',
	lastName: '',
	avatar: 'assets/images/avatars/profile.jpg',
	nickname: '',
	company: '',
	jobTitle: '',
	email: '',
	phone: '',
	address: '',
	birthday: '',
	notes: ''
};

function ClassifyDialog(props) {
	const dispatch = useDispatch();
	const classifyDialog = useSelector(({ classifyApp }) => classifyApp.classify.classifyDialog);

	const { form, handleChange, setForm } = useForm(defaultFormState);

	const initDialog = useCallback(() => {
		/**
		 * Dialog type: 'edit'
		 */
		if (classifyDialog.type === 'edit' && classifyDialog.data) {
			setForm({ ...classifyDialog.data });
		}

		/**
		 * Dialog type: 'new'
		 */
		if (classifyDialog.type === 'new') {
			setForm({
				...defaultFormState,
				...classifyDialog.data,
				id: FuseUtils.generateGUID()
			});
		}
	}, [classifyDialog.data, classifyDialog.type, setForm]);

	useEffect(() => {
		/**
		 * After Dialog Open
		 */
		if (classifyDialog.props.open) {
			initDialog();
		}
	}, [classifyDialog.props.open, initDialog]);

	function closeComposeDialog() {
		classifyDialog.type === 'edit' ? dispatch(closeEditClassifyDialog()) : dispatch(closeNewClassifyDialog());
	}

	function canBeSubmitted() {
		return form.name.length > 0;
	}

	function handleSubmit(event) {
		event.preventDefault();

		if (classifyDialog.type === 'new') {
			dispatch(addClassify(form));
		} else {
			dispatch(updateClassify(form));
		}
		closeComposeDialog();
	}

	function handleRemove() {
		dispatch(removeClassify(form.id));
		closeComposeDialog();
	}

	return (
		<Dialog
			classes={{
				paper: 'm-24'
			}}
			{...classifyDialog.props}
			onClose={closeComposeDialog}
			fullWidth
			maxWidth="xs"
		>
			<AppBar position="static" elevation={1}>
				<Toolbar className="flex w-full">
					<Typography variant="subtitle1" color="inherit">
						{classifyDialog.type === 'new' ? 'New Classify' : 'Edit Classify'}
					</Typography>
				</Toolbar>
				<div className="flex flex-col items-center justify-center pb-24">
					<Avatar className="w-96 h-96" alt="classify avatar" src={form.avatar} />
					{classifyDialog.type === 'edit' && (
						<Typography variant="h6" color="inherit" className="pt-8">
							{form.name}
						</Typography>
					)}
				</div>
			</AppBar>
			<form noValidate onSubmit={handleSubmit} className="flex flex-col md:overflow-hidden">
				<DialogContent classes={{ root: 'p-24' }}>
					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">account_circle</Icon>
						</div>

						<TextField
							className="mb-24"
							label="Name"
							autoFocus
							id="name"
							name="name"
							value={form.name}
							onChange={handleChange}
							variant="outlined"
							required
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20" />
						<TextField
							className="mb-24"
							label="Last name"
							id="lastName"
							name="lastName"
							value={form.lastName}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">star</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Nickname"
							id="nickname"
							name="nickname"
							value={form.nickname}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">phone</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Phone"
							id="phone"
							name="phone"
							value={form.phone}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">email</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Email"
							id="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">domain</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Company"
							id="company"
							name="company"
							value={form.company}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">work</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Job title"
							id="jobTitle"
							name="jobTitle"
							value={form.jobTitle}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">cake</Icon>
						</div>
						<TextField
							className="mb-24"
							id="birthday"
							label="Birthday"
							type="date"
							value={form.birthday}
							onChange={handleChange}
							InputLabelProps={{
								shrink: true
							}}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">home</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Address"
							id="address"
							name="address"
							value={form.address}
							onChange={handleChange}
							variant="outlined"
							fullWidth
						/>
					</div>

					<div className="flex">
						<div className="min-w-48 pt-20">
							<Icon color="action">note</Icon>
						</div>
						<TextField
							className="mb-24"
							label="Notes"
							id="notes"
							name="notes"
							value={form.notes}
							onChange={handleChange}
							variant="outlined"
							multiline
							rows={5}
							fullWidth
						/>
					</div>
				</DialogContent>

				{classifyDialog.type === 'new' ? (
					<DialogActions className="justify-between pl-16">
						<Button
							variant="contained"
							color="primary"
							onClick={handleSubmit}
							type="submit"
							disabled={!canBeSubmitted()}
						>
							Add
						</Button>
					</DialogActions>
				) : (
					<DialogActions className="justify-between pl-16">
						<Button
							variant="contained"
							color="primary"
							type="submit"
							onClick={handleSubmit}
							disabled={!canBeSubmitted()}
						>
							Save
						</Button>
						<IconButton onClick={handleRemove}>
							<Icon>delete</Icon>
						</IconButton>
					</DialogActions>
				)}
			</form>
		</Dialog>
	);
}

export default ClassifyDialog;
