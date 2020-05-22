import React from 'react';
import List from '@material-ui/core/List';
import OptionFormListItem from './OptionFormListItem';
import OptionFormAddListItem from './OptionFormAddListItem';

function OptionFormList(props) {
	function handleListItemChange(item) {
		props.onCheckListChange(props.checklist.map(_item => (_item.id === item.id ? item : _item)));
	}

	function handleListItemRemove(id) {
		props.onCheckListChange(props.checklist.filter(_item => _item.id !== id));
	}

	function handleListItemAdd(item) {
		props.onCheckListChange([...props.checklist, item]);
	}

	if (!props.checklist) {
		return null;
	}

	return (
		<div className={props.className}>
			<List dense>
				{props.checklist.map(item => (
					<OptionFormListItem
						item={item}
						key={item.id}
						onListItemChange={handleListItemChange}
						onListItemRemove={handleListItemRemove}
					/>
				))}
				<OptionFormAddListItem onListItemAdd={handleListItemAdd} />
			</List>
		</div>
	);
}

export default OptionFormList;
