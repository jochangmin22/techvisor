import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from '@fuse/hooks';
import Typography from '@material-ui/core/Typography';
import ChipInput from 'material-ui-chip-input';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import _ from '@lodash';
import LeftConfig from './setLeftConfig';
import * as Actions from '../store/actions';

// TODO: change focus next textField
// TODO: DnD word chip
const useStyles = makeStyles(theme => ({
	root: {
		'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderWidth: 0
		},
		// "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
		//     borderWidth: 2,
		//     borderColor: "red"
		// },
		'&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderWidth: 1,
			borderColor: theme.palette.secondary.main
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderWidth: 2,
			borderColor: theme.palette.primary.main
		}
	},
	customBg: {
		marginBottom: theme.spacing(2),
		backgroundColor: theme.palette.type === 'light' ? theme.palette.background.paper : theme.palette.primary.dark
	},
	chipInput: {
		paddingRight: theme.spacing(1)
	}
}));

function MuiChipInput(props) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const { options, defaultFormValue } = LeftConfig;
	const [searchVolume, setSearchVolume] = useState('SUM');

	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const searchSubmit = useSelector(({ searchApp }) => searchApp.searchs.searchSubmit);
	const searchScope = useSelector(({ searchApp }) => searchApp.searchs.searchScope);

	const [submitted, setSubmitted] = useState(searchSubmit);

	const [termsRowCount, setTermsRowCount] = useState(0);

	const { form, handleChange, setForm } = useForm(searchParams ? { ...searchParams } : { ...defaultFormValue });

	// useEffect(() => {}, [dateState, setDateState]);
	useEffect(() => {}, [dispatch]);

	useEffect(() => {
		setTermsRowCount(form.terms && form.terms.length > 0 ? form.terms.length : 0);
	}, [form]);

	function handleAddChip(value, key, name) {
		const newArray = form[name];
		const newValue = value.trim();
		if (key !== null) {
			// terms
			if (newArray[key] === undefined)
				// newArray.push(Array.isArray(value) ? value : [value]);
				newArray.push([newValue]);
			else newArray[key].push(newValue);
		} else if (newArray === undefined) newArray.push([newValue]);
		else newArray.push(newValue); // inventor, assignee

		setForm(_.set({ ...form }, name, newArray));
		setSubmitted(true);
	}

	function handleDeleteChip(index, key, name) {
		const newArray = form[name];
		if (key !== null) {
			// terms
			newArray[key].splice(index, 1);
			if (newArray[key].length === 0) {
				newArray.splice(key, 1);
			}
		} else {
			newArray.splice(index, 1); // inventor, assignee
		}
		setForm(_.set({ ...form }, name, newArray));
		setSubmitted(true);
	}

	return (
		<div className="px-24 py-8">
			<Typography variant="subtitle1" className="mb-8">
				검색 용어
			</Typography>
			{form.terms &&
				form.terms.length > 0 &&
				form.terms.map((value, key) => (
					<ChipInput
						value={value} // JSON.stringify(nameList)
						fullWidth
						variant="outlined" // standard, outlined, filled
						className={clsx(classes.root, classes.customBg, 'input:', classes.chipInput)}
						placeholder=" or + Synonym"
						// clearInputValueOnChange={true}
						onAdd={chip => handleAddChip(chip, key, 'terms')}
						onDelete={(chip, index) => handleDeleteChip(index, key, 'terms')}
						key={key}
					/>
				))}
			<ChipInput
				value={[]}
				fullWidth
				className={clsx(classes.root, classes.customBg, 'input:', classes.chipInput)}
				placeholder=" or + Synonym"
				onAdd={chip => handleAddChip(chip, termsRowCount, 'terms')}
				onDelete={(chip, index) => handleDeleteChip(chip, index, termsRowCount, 'terms')}
				variant="outlined"
				key={termsRowCount}
			/>
		</div>
	);
}

export default MuiChipInput;

{
	/* <Select
    id="ipType"
    name="ipType"
    displayEmpty
    // placeholder="종류"
    // multiple
    value={form.ipType}
    className="bg-white"
    // onChange={value => handleChipChange(value, "type")}
    onChange={e => handleSelectChange(e, "ipType")}
    // input={<Input id="select-multiple-chip" />}
    // renderValue={selected => (
    //     <div className={classes.chips}>
    //         {selected.map(value => (
    //             <Chip
    //                 key={value}
    //                 label={value}
    //                 className={classes.chip}
    //             />
    //         ))}
    //     </div>
    // )}
    // MenuProps={MenuProps}
    variant="outlined"
>
    <MenuItem value="" className="text-purple-300" disabled>
        종류
    </MenuItem>
    {options.type.map(name => (
        <MenuItem
            key={name}
            value={name}
            // style={getStyles(name, personName, theme)}
        >
            {name}
        </MenuItem>
    ))}
</Select> */
}
