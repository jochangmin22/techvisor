import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';
import Icon from '@material-ui/core/Icon';
// import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
// import Checkbox from '@material-ui/core/Checkbox';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
// import ListItemText from '@material-ui/core/ListItemText';
// import Divider from '@material-ui/core/Divider';
// import amber from '@material-ui/core/colors/amber';
// import red from '@material-ui/core/colors/red';
// import FuseUtils from '@fuse/utils/FuseUtils';
// import { useForm } from '@fuse/hooks';
import { useDispatch, useSelector } from 'react-redux';
// import moment from 'moment/moment';
import _ from '@lodash';
import * as Actions from './store/actions';

const defaultFormState = {
	id: '',
	title: '',
	eKeyword: '',
	notes: '',
	//    'startDate': new Date(),
	//    'dueDate'  : new Date(),
	completed: false,
	starred: false,
	important: false,
	deleted: false,
	labels: []
};

function SearchDialog(props) {
	const dispatch = useDispatch();
	const searchDialog = useSelector(({ searchApp }) => searchApp.searchs.searchDialog);
	const searchExtendText = useSelector(({ searchApp }) => searchApp.searchExtendText);
	const labels = useSelector(({ searchApp }) => searchApp.labels);

	const [labelMenuEl, setLabelMenuEl] = useState(null);
	const { form, handleChange, setForm } = useForm({ ...defaultFormState });
	// const startDate = moment(form.startDate).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
	// const dueDate = moment(form.dueDate).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);

	const initDialog = useCallback(() => {
		/**
		 * Dialog type: 'edit'
		 */
		if (searchDialog.type === 'edit' && searchDialog.data) {
			setForm({ ...searchDialog.data });
		}

		/**
		 * Dialog type: 'new'
		 */
		if (searchDialog.type === 'new') {
			setForm({
				...defaultFormState,
				...searchDialog.data,
				id: FuseUtils.generateGUID()
			});
		}
	}, [searchDialog.data, searchDialog.type, setForm]);

	useEffect(() => {
		/**
		 * After Dialog Open
		 */
		if (searchDialog.props.open) {
			initDialog();
		}
	}, [searchDialog.props.open, initDialog]);

	function closeSearchDialog() {
		searchDialog.type === 'edit' ? dispatch(closeEditSearchDialog()) : dispatch(closeNewSearchDialog());
	}

	function handleLabelMenuOpen(event) {
		setLabelMenuEl(event.currentTarget);
	}

	function handleLabelMenuClose(event) {
		setLabelMenuEl(null);
	}

	function handleToggleImportant() {
		setForm({
			...form,
			important: !form.important
		});
	}

	function handleToggleStarred() {
		setForm({
			...form,
			starred: !form.starred
		});
	}

	function handleToggleLabel(event, id) {
		event.stopPropagation();
		setForm(
			_.set({
				...form,
				labels: form.labels.includes(id) ? form.labels.filter(labelId => labelId !== id) : [...form.labels, id]
			})
		);
	}

	function toggleCompleted() {
		setForm({
			...form,
			completed: !form.completed
		});
	}

	function canBeSubmitted() {
		return form.eKeyword.length > 0;
	}

	function handleSubmit(ev) {
		ev.preventDefault();
		// resetForm();
		setForm();
	}

	return (
		<Dialog {...searchDialog.props} onClose={closeSearchDialog} fullWidth maxWidth="sm">
			<AppBar position="static" elevation={1}>
				<Toolbar className="flex w-full">
					<Typography variant="subtitle1" color="inherit">
						<span className="material-icons MuiIcon-root" aria-hidden="true">
							note
						</span>
						{/* searchDialog.type === 'new' ? '검색어 확장' : '검색어 확장' */}
					</Typography>
				</Toolbar>
			</AppBar>

			<form
				name="extForm"
				id="extForm"
				noValidate
				className="flex flex-col justify-center w-full"
				onSubmit={handleSubmit}
			>
				<DialogContent classes={{ root: 'p-0' }}>
					{/*                 <div className="mb-16">
                    <div className="flex items-center justify-between p-12">

                        <div className="flex">
                            <Checkbox
                                tabIndex={-1}
                                checked={form.completed}
                                onChange={toggleCompleted}
                                onClick={(ev) => ev.stopPropagation()}
                            />
                        </div>

                        <div className="flex items-center justify-start" aria-label="Toggle star">
                            <IconButton onClick={handleToggleImportant}>
                                {form.important ? (
                                    <Icon style={{color: red[500]}}>error</Icon>
                                ) : (
                                    <Icon>error_outline</Icon>
                                )}
                            </IconButton>

                            <IconButton onClick={handleToggleStarred}>
                                {form.starred ? (
                                    <Icon style={{color: amber[500]}}>star</Icon>
                                ) : (
                                    <Icon>star_outline</Icon>
                                )}
                            </IconButton>
                            <div>
                                <IconButton
                                    aria-owns={labelMenuEl ? 'label-menu' : null}
                                    aria-haspopup="true"
                                    onClick={handleLabelMenuOpen}
                                >
                                    <Icon>label</Icon>
                                </IconButton>
                                <Menu
                                    id="label-menu"
                                    anchorEl={labelMenuEl}
                                    open={Boolean(labelMenuEl)}
                                    onClose={handleLabelMenuClose}
                                >
                                    {labels.length > 0 && labels.map((label) => (
                                        <MenuItem onClick={(ev) => handleToggleLabel(ev, label.id)} key={label.id}>
                                            <ListItemIcon className="min-w-40">
                                                <Icon className="mr-0" color="action">
                                                    {form.labels.includes(label.id) ? 'check_box' : 'check_box_outline_blank'}
                                                </Icon>
                                            </ListItemIcon>
                                            <ListItemText primary={label.title} disableTypography={true}/>
                                            <ListItemIcon className="min-w-40">
                                                <Icon className="mr-0" style={{color: label.color}} color="action">
                                                    label
                                                </Icon>
                                            </ListItemIcon>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </div>
                        </div>
                    </div>
                    <Divider className="mx-24"/>
                </div> */}

					{form.labels.length > 0 && (
						<div className="flex flex-wrap  px-16 sm:px-24 my-16">
							{form.labels.map(label => (
								<Chip
									avatar={
										<Avatar
											classes={{
												colorDefault: 'bg-transparent'
											}}
										>
											<Icon
												className="text-20"
												style={{
													color: _.find(labels, {
														id: label
													}).color
												}}
											>
												label
											</Icon>
										</Avatar>
									}
									label={_.find(labels, { id: label }).title}
									onDelete={ev => handleToggleLabel(ev, label)}
									className="mr-8 my-8"
									classes={{ label: 'pl-4' }}
									key={label}
								/>
							))}
						</div>
					)}

					<div className="px-16 sm:px-24">
						<FormControl className="mt-8 mb-16" required fullWidth>
							<TextField
								label="검색할 키워드를 하나만 입력해 주십시오."
								placeholder="검색"
								autoFocus
								// name="eKeyword"
								// value={form.eKeyword}
								// onChange={handleChange}
								value={searchExtendText}
								inputProps={{
									'aria-label': 'Search'
								}}
								onChange={ev => dispatch(setSearchExtendText(ev))}
								required
								variant="outlined"
							/>
						</FormControl>
						{/*
                    <FormControl className="mt-8 mb-16" required fullWidth>
                        <TextField
                            label="Notes"
                            name="notes"
                            multiline
                            rows="6"
                            value={form.notes}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </FormControl>
                     <div className="flex">
                        <TextField
                            name="startDate"
                            label="Start Date"
                            type="datetime-local"
                            className="mt-8 mb-16 mr-8"
                            InputLabelProps={{
                                shrink: true
                            }}
                            inputProps={{
                                max: dueDate
                            }}
                            value={startDate}
                            onChange={handleChange}
                            variant="outlined"
                        />
                        <TextField
                            name="dueDate"
                            label="Due Date"
                            type="datetime-local"
                            className="mt-8 mb-16 ml-8"
                            InputLabelProps={{
                                shrink: true
                            }}
                            inputProps={{
                                min: startDate
                            }}
                            value={dueDate}
                            onChange={handleChange}
                            variant="outlined"
                        />
                    </div> */}
					</div>
				</DialogContent>

				<DialogActions className="justify-between pl-8 sm:pl-16">
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							dispatch(setExtend(form));
							closeSearchDialog();
						}}
						disabled={!canBeSubmitted()}
					>
						적용
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default SearchDialog;
