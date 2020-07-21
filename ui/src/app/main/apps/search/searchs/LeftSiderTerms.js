import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useUpdateEffect } from '@fuse/hooks';
import InputBase from '@material-ui/core/InputBase';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import FuseChipSelect from '@fuse/core/FuseChipSelect';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import ChipInput from 'material-ui-chip-input';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import _ from '@lodash';
import LeftConfig from './setLeftConfig';
import parseSearchText from '../inc/parseSearchText';
import {
	getSearchs,
	getSearchsNum,
	getWordCloud,
	getSubjectRelation,
	getMatrix,
	clearSearchs,
	clearSearchText,
	setSearchLoading,
	setSearchParams,
	setSearchSubmit,
	initialState
} from '../store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';

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
	},
	formControl: {
		margin: theme.spacing(2)
	}
}));

const BootstrapInput = withStyles(theme => ({
	root: {
		'label + &': {
			marginTop: theme.spacing(3)
		},
		// "& input:invalid": {
		//     borderColor: "red",
		//     borderWidth: 2
		// },
		'& input': {
			borderRadius: 4,
			position: 'relative',
			backgroundColor:
				theme.palette.type === 'light' ? theme.palette.background.paper : theme.palette.primary.dark,
			border: 0,
			padding: '10px 26px 10px 12px',
			transition: theme.transitions.create(['border-color', 'box-shadow']),
			'&:focus': {
				borderRadius: 4,
				borderWidth: 2,
				borderColor: theme.palette.primary.main
			}
		}
	}
}))(InputBase);

const LeftSiderTerms = React.forwardRef(function (props, ref) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const { options, defaultFormValue } = LeftConfig;
	const [searchVolume, setSearchVolume] = useState('SUM');

	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const searchSubmit = useSelector(({ searchApp }) => searchApp.searchs.searchSubmit);
	const searchScope = useSelector(({ searchApp }) => searchApp.searchs.searchScope);

	const [submitted, setSubmitted] = useState(searchSubmit);

	const [termsRowCount, setTermsRowCount] = useState(0);

	// startDate, endDate were uncontrolled components so manually controlled
	const [dateState, setDateState] = useState({
		startDateReset: 0,
		endDateReset: 0,
		startDate: searchParams.startDate,
		endDate: searchParams.endDate
	});

	const { form, handleChange, setForm } = useForm(searchParams ? { ...searchParams } : { ...defaultFormValue });

	useUpdateEffect(() => {
		// Sync from leftSidebar to header
		const [_params, params] = parseSearchText(form, null);
		dispatch(setSearchParams(_params));

		function checkValidate() {
			if (
				form.dateType === '' &&
				((form.startDate !== undefined && form.startDate.length > 0) ||
					(form.endDate !== undefined && form.endDate.length > 0))
			) {
				dispatch(
					showMessage({
						message: '일자종류도 선택하세요.',
						autoHideDuration: 2000
					})
				);
				return false;
			} else if (
				form.dateType.length > 0 &&
				(form.startDate === undefined || form.startDate.length === 0) &&
				(form.endDate === undefined || form.endDate.length === 0)
			) {
				dispatch(
					showMessage({
						message: '일자도 선택하세요.',
						autoHideDuration: 2000
					})
				);
				return false;
			} else {
				return true;
			}
		}

		if (checkValidate() && submitted) {
			// onSearch(form);
			onSearch(params, form.searchNum);
		}
		// eslint-disable-next-line
	}, [form, searchVolume]);

	useUpdateEffect(() => {
		// Sync from header to leftSidebar
		setForm(searchParams);
		setDateState({
			...dateState,
			startDate: searchParams.startDate,
			endDate: searchParams.endDate
		});
		setSubmitted(searchSubmit);
	}, [searchParams.searchText, searchParams.searchNum]);

	// useEffect(() => {}, [dateState, setDateState]);
	useEffect(() => {}, [dispatch]);

	useEffect(() => {
		setTermsRowCount(form.terms && form.terms.length > 0 ? form.terms.length : 0);
	}, [form]);

	React.useImperativeHandle(ref, () => {
		return {
			clearTerms() {
				dispatch(clearSearchText());
			}
		};
	});

	function handleRadioChange(ev) {
		setSearchVolume(ev.target.value);
		setSubmitted(true);
	}

	function handleChipChange(value, name) {
		// single value only
		if (name === 'ipType' || name === 'status') {
			const newValue = value.length === 0 ? [] : [value[value.length - 1].value];
			setForm(_.set({ ...form }, name, newValue));
		} else {
			// language, patentOffice ; 아직 미사용
			setForm(
				_.set(
					{ ...form },
					name,
					value.map(item => item.value)
				)
			);
		}
		setSubmitted(true);
	}

	function handleDateChange(ev) {
		const { value, name } = ev.target;
		setDateState({ ...dateState, [name]: value });
		if ((value.length === 8 && /^\d+$/.test(value)) || value.length === 0) {
			if (form[name] !== value) {
				if (form.dateType === '') {
					dispatch(
						showMessage({
							message: '일자종류를 선택하세요.',
							autoHideDuration: 2000
						})
					);
				}
				setForm(_.set({ ...form }, name, value));
			}
		}
		setSubmitted(true);
	}

	// function handleKeyPress(e) {
	// 	if (e.keyCode === 13) {
	// 		e.preventDefault();
	// 		// if (!_.isEqual(e.target.value, form[name])) e.target.blur();
	// 		e.target.blur();
	// 	}
	// }

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

	function onSearch(mainParams, num = '') {
		// check if mainParams is empty
		if (Object.keys(mainParams).every(k => mainParams[k] === '')) {
			return;
		}
		const params = {
			params: mainParams,
			subParams: {
				searchScope: { ...searchScope, searchVolume: searchVolume },
				matrix: initialState.matrix,
				subjectRelation: initialState.subjectRelation
			}
		};
		// const subParams = {
		// 	searchScope: { ...searchScope, searchVolume: searchVolume },
		// 	matrix: initialState.matrix,
		// 	subjectRelation: initialState.subjectRelation
		// };

		dispatch(setSearchLoading(true));
		dispatch(clearSearchs());
		if (num === '') {
			dispatch(getSearchs(params)).then(() => {
				dispatch(getWordCloud(params));
				dispatch(getSubjectRelation(params));
				dispatch(getMatrix(params));
				dispatch(setSearchLoading(false));
				dispatch(setSearchSubmit(false));
			});
		} else {
			dispatch(getSearchsNum({ searchNum: num })).then(() => {
				dispatch(getWordCloud({ searchNum: num }));
				dispatch(getSubjectRelation({ searchNum: num }));
				// dispatch(getMatrix(params));
				dispatch(setSearchLoading(false));
				dispatch(setSearchSubmit(false));
			});
		}
		setSubmitted(false);
	}

	function handleReset(name) {
		setDateState({ ...dateState, [name]: '', [`${name}Reset`]: `${name}Reset` + 1 });
		setForm(_.set({ ...form }, name, ''));
	}

	return (
		<FuseScrollbars className="flex flex-auto flex-col min-h-2xl">
			<div className="px-24 py-8">
				<Typography variant="subtitle1">검색 범위</Typography>
				<FormControl component="fieldset" className={classes.formControl}>
					{/* <FormLabel component="legend">검색 범위</FormLabel> */}
					<RadioGroup
						aria-label="searchVolume"
						name="searchVolume"
						value={searchVolume}
						onChange={handleRadioChange}
					>
						<FormControlLabel
							value="SUM"
							control={<Radio color="default" />}
							label="서지+요약+대표청구항"
						/>
						<FormControlLabel
							value="SUMA"
							control={<Radio color="default" />}
							label="서지+요약+전체청구항"
						/>
						<FormControlLabel value="ALL" control={<Radio color="default" />} label="전체문서" disabled />
					</RadioGroup>
				</FormControl>
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
				<Typography variant="subtitle1" className="mb-8">
					검색 항목
				</Typography>
				<FormControl className="flex justify-center items-start">
					<InputLabel id="dateType">일자종류</InputLabel>
					<Select
						labelId="dateType"
						id="dateType"
						name="dateType"
						className="mb-16 min-w-96"
						value={form.dateType}
						onChange={handleChange}
						variant="outlined"
						input={<BootstrapInput />}
					>
						<MenuItem value="">
							<em>None</em>
						</MenuItem>
						{Object.entries(options.dateType).map(([key, val]) => (
							// {options.dateType.map(item => (
							<MenuItem key={key} value={key}>
								{val}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={dateState.startDateReset + 'startDate'}
						name="startDate"
						onChange={handleDateChange}
						value={dateState.startDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="YYYYMMDD"
						error={!(form.startDate && form.startDate.length === 8 && /^\d+$/.test(form.startDate))}
						InputProps={{
							classes: {
								root: 'p-0',
								input: 'pl-14 pr-0'
							},
							endAdornment: (
								<InputAdornment position="end">
									{form.startDate && (
										<IconButton onClick={() => handleReset('startDate')} size="small">
											<Icon className="text-20" color="action">
												clear
											</Icon>
										</IconButton>
									)}
								</InputAdornment>
							)
						}}
						// helperText="This is Helper Text"
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={dateState.endDateReset + 'endDate'}
						name="endDate"
						onChange={handleDateChange}
						value={dateState.endDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="YYYYMMDD"
						InputProps={{
							classes: {
								root: 'p-0',
								input: 'pl-14 pr-0'
							},
							endAdornment: (
								<InputAdornment position="end">
									{form.endDate && (
										<IconButton onClick={() => handleReset('endDate')} size="small">
											<Icon className="text-20" color="action">
												clear
											</Icon>
										</IconButton>
									)}
								</InputAdornment>
							)
						}}
					/>
				</FormControl>
				<FormControl className="flex justify-center items-start">
					<ChipInput
						value={form.inventor}
						fullWidth
						className={clsx(classes.root, classes.customBg)}
						placeholder=" + 발명자"
						clearInputValueOnChange
						onAdd={chip => handleAddChip(chip, null, 'inventor')}
						onDelete={(chip, index) => handleDeleteChip(chip, index, null, 'inventor')}
						// InputProps={{
						//     startAdornment: (
						//         <InputAdornment position="start">
						//             <People color="action" />
						//         </InputAdornment>
						//     )
						// }}
						variant="outlined"
					/>
				</FormControl>
				<FormControl className="flex justify-center items-start">
					<ChipInput
						value={form.assignee}
						fullWidth
						className={clsx(classes.root, classes.customBg)}
						// label="용어 검색"
						placeholder=" + 출원인"
						onAdd={chip => handleAddChip(chip, null, 'assignee')}
						onDelete={(chip, index) => handleDeleteChip(chip, index, null, 'assignee')}
						variant="outlined"
					/>
				</FormControl>
				<div className="flex justify-center items-start">
					<FuseChipSelect
						className={clsx(classes.root, classes.customBg, 'w-full')}
						value={form.patentOffice.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'patentOffice')}
						placeholder="특허 기관"
						textFieldProps={{
							variant: 'outlined'
						}}
						styles={{
							input: styles => ({
								...styles,
								minHeight: '34px'
							})
						}}
						options={options.patentOffice.map(item => ({
							value: item,
							label: item
						}))}
						isMulti
					/>
				</div>
				<div className="flex justify-center items-start">
					<FuseChipSelect
						className={clsx(classes.root, classes.customBg, 'w-full')}
						value={form.language.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'language')}
						placeholder="언어"
						textFieldProps={{
							variant: 'outlined'
						}}
						styles={{
							input: styles => ({
								...styles,
								minHeight: '34px'
							})
						}}
						options={options.language.map(item => ({
							value: item,
							label: item
						}))}
						isMulti
					/>
				</div>
				<div className="w-full">
					<FuseChipSelect
						className={clsx(classes.root, classes.customBg, 'w-full')}
						value={form.status.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'status')}
						placeholder="상태"
						textFieldProps={{
							variant: 'outlined'
						}}
						styles={{
							input: styles => ({
								...styles,
								minHeight: '34px'
							})
						}}
						options={options.status.map(item => ({
							value: item,
							label: item
						}))}
						isMulti
					/>
					{/* <Select
                        // labelId="status-label"
                        id="status"
                        name="status"
                        displayEmpty
                        // placeholder="종류"
                        // multiple
                        value={form.status}
                        className="bg-white"
                        // onChange={value => handleChipChange(value, "status")}
                        onChange={e => handleSelectChange(e, "status")}
                        // InputProps={{
                        //     classes: {
                        //         notchedOutline: "p-14"
                        //     }
                        // }}
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
                        <MenuItem value="" disabled>
                            상태
                        </MenuItem>
                        {options.status.map(name => (
                            <MenuItem
                                key={name}
                                value={name}
                                // style={getStyles(name, personName, theme)}
                            >
                                {name}
                            </MenuItem>
                        ))}
                    </Select> */}
				</div>
				<div className="w-full">
					<FuseChipSelect
						className={clsx(classes.root, classes.customBg, 'w-full')}
						value={form.ipType.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'ipType')}
						placeholder="종류"
						textFieldProps={{
							variant: 'outlined'
						}}
						styles={{
							input: styles => ({
								...styles,
								minHeight: '34px'
							})
						}}
						options={options.ipType.map(item => ({
							value: item,
							label: item
						}))}
						isMulti
					/>
					{/* <Select
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
                    </Select> */}
				</div>
			</div>
		</FuseScrollbars>
	);
});

export default LeftSiderTerms;
