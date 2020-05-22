import React, { useState } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Input from '@material-ui/core/Input';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { useForm, useUpdateEffect } from '@fuse/hooks';
import moment from 'moment';
import _ from '@lodash';
import { withRouter } from 'react-router-dom';
// import OptionReminderLabel from "app/main/search/OptionReminderLabel";
// import OptionLabel from "app/main/search/OptionLabel";
import OptionModel from 'app/main/search/model/OptionModel';
// import OptionFormList from "./checklist/OptionFormList";
// import OptionFormReminder from "./OptionFormReminder";
// import OptionFormUploadImage from "./OptionFormUploadImage";
// import OptionFormLabelMenu from "./OptionFormLabelMenu";

function OptionForm(props) {
	const [showList, setShowList] = useState(false);
	const { form: optionForm, handleChange, setForm } = useForm(
		_.merge(
			{},
			new OptionModel(),
			props.note,
			props.match.params.labelId ? { labels: [props.match.params.labelId] } : null,
			props.match.params.id === 'archive' ? { archive: true } : null
		)
	);
	const { onChange } = props;

	useUpdateEffect(() => {
		if (optionForm && onChange) {
			onChange(optionForm);
		}
	}, [optionForm, onChange]);

	function handleOnCreate(event) {
		if (!props.onCreate) {
			return;
		}
		props.onCreate(optionForm);
	}

	function handleToggleList() {
		setShowList(!showList);
	}

	function handleDateChange(date) {
		setForm(_.setIn(optionForm, 'reminder', date));
	}

	function handleChecklistChange(checklist) {
		setForm(_.setIn(optionForm, `checklist`, checklist));
	}

	function handleRemoveLabel(id) {
		setForm(
			_.setIn(
				optionForm,
				`labels`,
				optionForm.labels.filter(_id => _id !== id)
			)
		);
	}

	function handleLabelsChange(labels) {
		setForm(_.setIn(optionForm, `labels`, labels));
	}

	function handleRemoveImage() {
		setForm(_.setIn(optionForm, `image`, ''));
	}

	function handleArchiveToggle() {
		setForm(_.setIn(optionForm, `archive`, !optionForm.archive));
		if (props.variant === 'new') {
			setTimeout(() => handleOnCreate());
		}
	}

	function handleUploadChange(e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();

		reader.readAsBinaryString(file);

		reader.onload = () => {
			setForm(_.setIn(optionForm, `image`, `data:${file.type};base64,${btoa(reader.result)}`));
		};

		reader.onerror = function() {
			console.log('error on load image');
		};
	}

	function newFormButtonDisabled() {
		return (
			optionForm.title === '' &&
			optionForm.image === '' &&
			optionForm.description === '' &&
			optionForm.checklist.length === 0
		);
	}

	if (!optionForm) {
		return null;
	}

	return (
		<div className="flex flex-col w-full">
			<FuseScrollbars className="flex flex-auto w-full max-h-640">
				<div className="w-full">
					{optionForm.image && optionForm.image !== '' && (
						<div className="relative">
							<img src={optionForm.image} className="w-full block" alt="note" />
							<Fab
								className="absolute right-0 bottom-0 m-8"
								variant="extended"
								size="small"
								color="secondary"
								aria-label="Delete Image"
								onClick={handleRemoveImage}
							>
								<Icon fontSize="small">delete</Icon>
							</Fab>
						</div>
					)}
					<div className="p-16 pb-12">
						<Input
							className="font-bold"
							placeholder="Title"
							type="text"
							name="title"
							value={optionForm.title}
							onChange={handleChange}
							disableUnderline
							fullWidth
						/>
					</div>
					<div className="p-16 pb-12">
						<Input
							placeholder="Take a note..."
							multiline
							rows="4"
							name="description"
							value={optionForm.description}
							onChange={handleChange}
							disableUnderline
							fullWidth
							autoFocus
						/>
					</div>

					{(optionForm.checklist.length > 0 || showList) && (
						<div className="px-16">
							{/* <OptionFormList
                                checklist={optionForm.checklist}
                                onCheckListChange={handleChecklistChange}
                            /> */}
						</div>
					)}

					{(optionForm.labels || optionForm.reminder || optionForm.time) && (
						<div className="flex flex-wrap w-full p-16 pb-12">
							{optionForm.reminder &&
								{
									/* <OptionReminderLabel
                                    className="mt-4 mr-4"
                                    date={optionForm.reminder}
                                /> */
								}}
							{optionForm.labels &&
								optionForm.labels.map(id => ({
									/* <OptionLabel
                                        id={id}
                                        key={id}
                                        className="mt-4 mr-4"
                                        onDelete={() => handleRemoveLabel(id)}
                                    /> */
								}))}
							{optionForm.time && (
								<Typography color="textSecondary" className="text-12 ml-auto mt-8 mr-4">
									Edited: {moment(optionForm.time).format('MMM DD YY, h:mm A')}
								</Typography>
							)}
						</div>
					)}
				</div>
			</FuseScrollbars>

			<div className="flex flex-auto justify-between items-center h-48">
				<div className="flex items-center px-4">
					<Tooltip title="Remind me" placement="bottom">
						<div>
							{/* <OptionFormReminder
                                reminder={optionForm.reminder}
                                onChange={handleDateChange}
                            /> */}
						</div>
					</Tooltip>

					<Tooltip title="Add image" placement="bottom">
						<div>
							{/* <OptionFormUploadImage
                                onChange={handleUploadChange}
                            /> */}
						</div>
					</Tooltip>

					<Tooltip title="Add checklist" placement="bottom">
						<IconButton className="w-32 h-32 mx-4 p-0" onClick={handleToggleList}>
							<Icon fontSize="small">playlist_add_check</Icon>
						</IconButton>
					</Tooltip>

					<Tooltip title="Change labels" placement="bottom">
						<div>
							{/* <OptionFormLabelMenu
                                note={optionForm}
                                onChange={handleLabelsChange}
                            /> */}
						</div>
					</Tooltip>

					<Tooltip title={optionForm.archive ? 'Unarchive' : 'Archive'} placement="bottom">
						<div>
							<IconButton
								className="w-32 h-32 mx-4 p-0"
								onClick={handleArchiveToggle}
								disabled={newFormButtonDisabled()}
							>
								<Icon fontSize="small">{optionForm.archive ? 'unarchive' : 'archive'}</Icon>
							</IconButton>
						</div>
					</Tooltip>
				</div>
				<div className="flex items-center px-4">
					{props.variant === 'new' ? (
						<Button
							className="m-4"
							onClick={handleOnCreate}
							variant="outlined"
							size="small"
							disabled={newFormButtonDisabled()}
						>
							Create
						</Button>
					) : (
						<>
							<Tooltip title="Delete Option" placement="bottom">
								<IconButton className="w-32 h-32 mx-4 p-0" onClick={props.onRemove}>
									<Icon fontSize="small">delete</Icon>
								</IconButton>
							</Tooltip>
							<Button className="m-4" onClick={props.onClose} variant="outlined" size="small">
								Close
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

OptionForm.propTypes = {};
OptionForm.defaultProps = {
	variant: 'edit',
	note: null
};

export default withRouter(OptionForm);
