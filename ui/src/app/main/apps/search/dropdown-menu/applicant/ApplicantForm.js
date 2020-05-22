import React, { useEffect, useMemo, useState } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useDebounce, useForm } from '@fuse/hooks';
import { useDispatch, useSelector } from 'react-redux';
import _ from '@lodash';
import * as Actions from 'app/main/search/store/actions';
// import ApplicantModel from "app/main/search/model/ApplicantModel";
const defaultFormState = {
	labels: []
};

function ApplicantForm(props) {
	const dispatch = useDispatch();
	const applicant = useSelector(({ searchApp }) => searchApp.applicant.data);
	const searchText = useSelector(({ searchApp }) => searchApp.searchs.searchText);

	const [SearchEl, setSearchEl] = useState(searchText);
	const { form, handleChange, setForm } = useForm({ ...defaultFormState });

	function handleApplicantChange(event, label) {
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

	return Object.entries(applicant).map(([key, label]) => (
		<FormControlLabel
			key={key}
			control={
				<Checkbox
					// checked={state.checkedA}
					// checked={newApplicantForm.completed}
					// onChange={toggleCompleted}
					// onChange={handleChange}
					onChange={ev => dispatch(Actions.appendSearchText(ev))}
					onClick={ev => handleApplicantChange(ev, label)}
					value={label}
				/>
			}
			label={label}
		/>
	));
}

export default ApplicantForm;
