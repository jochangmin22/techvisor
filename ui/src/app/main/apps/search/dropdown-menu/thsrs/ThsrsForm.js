import React, { useEffect, useMemo, useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useDebounce, useForm } from '@fuse/hooks';
import { useDispatch, useSelector } from 'react-redux';
import _ from '@lodash';
import * as Actions from 'app/main/apps/search/store/actions';
// import ThsrsModel from "app/main/search/model/ThsrsModel";
const defaultFormState = {
	labels: []
};

function ThsrsForm(props) {
	const dispatch = useDispatch();
	const thsrs = useSelector(({ searchApp }) => searchApp.thsrs.data);
	const searchText = useSelector(({ searchApp }) => searchApp.searchs.searchText);

	const [SearchEl, setSearchEl] = useState(searchText);
	const { form, handleChange, setForm } = useForm({ ...defaultFormState });

	function handleThsrsChange(event, label) {
		event.stopPropagation();
		setSearchEl(label);
		// setForm(
		//     _.set({
		//         ...form,
		//         labels: label
		//     })
		// );
		console.log(label);
		console.log(form.labels);
		console.log(searchText);
	}

	const [checked, setChecked] = React.useState([0]);

	const handleToggle = value => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setChecked(newChecked);
	};

	return Object.entries(thsrs).map(([key, label]) => (
		<FormControlLabel
			key={key}
			control={
				<Checkbox
					// checked={state.checkedA}
					// checked={newThsrsForm.completed}
					// onChange={toggleCompleted}
					// onChange={handleChange}
					onChange={ev => dispatch(appendSearchText(ev))}
					onClick={ev => handleThsrsChange(ev, label)}
					value={label}
				/>
			}
			label={label}
		/>
	));
}

export default ThsrsForm;
