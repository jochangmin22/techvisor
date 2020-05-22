import React from 'react';
import Icon from '@material-ui/core/Icon';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import OptionListItemModel from 'app/main/search/model/OptionListItemModel';
import { useForm } from '@fuse/hooks';

function OptionFormAddListItem(props) {
	const { form, handleChange, resetForm } = useForm({
		text: ''
	});

	function isFormInValid() {
		return form.text === '';
	}

	function handleSubmit(ev) {
		ev.preventDefault();
		if (isFormInValid()) {
			return;
		}
		props.onListItemAdd(new OptionListItemModel(form));
		resetForm();
	}

	return (
		<form onSubmit={handleSubmit}>
			<ListItem className="p-0" dense>
				<IconButton
					className="w-32 h-32 -ml-4 mr-4 p-0"
					aria-label="Add"
					type="submit"
					disabled={isFormInValid()}
				>
					<Icon fontSize="small">add</Icon>
				</IconButton>
				<Input
					className="flex flex-1"
					name="text"
					value={form.text}
					onChange={handleChange}
					placeholder="Add an item"
					disableUnderline
					autoFocus
				/>
			</ListItem>
		</form>
	);
}

export default OptionFormAddListItem;
