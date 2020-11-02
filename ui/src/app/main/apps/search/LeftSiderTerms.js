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
import { searchAppLeftConfig } from 'app/main/apps/lib/variables';
import parseSearchOptions from 'app/main/apps/lib/parseParamsSearch';
import {
	getSearchs,
	getWordCloud,
	getKeywords,
	getMatrix,
	getIndicator,
	clearSearchs,
	clearSearchText,
	setSearchLoading,
	setSearchParams,
	setSearchSubmit,
	initialState
} from 'app/main/apps/search/store/searchsSlice';
import { showMessage } from 'app/store/fuse/messageSlice';

// TODO: DnD word chip
const useStyles = makeStyles(theme => ({
	root: {
		marginBottom: theme.spacing(2),
		backgroundColor: theme.palette.type === 'light' ? theme.palette.background.paper : theme.palette.primary.dark,
		'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderWidth: 0
		},
		'&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderWidth: 1,
			borderColor: theme.palette.secondary.main
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderWidth: 2,
			borderColor: theme.palette.primary.main
		}
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

const insert = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];

const LeftSiderTerms = React.forwardRef(function (props, ref) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const { options } = searchAppLeftConfig;
	const [searchVolume, setSearchVolume] = useState('SUM');

	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const searchSubmit = useSelector(({ searchApp }) => searchApp.searchs.searchSubmit);
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);

	const [submitted, setSubmitted] = useState(searchSubmit);

	const [termsRowCount, setTermsRowCount] = useState(0);

	// startDate, endDate were uncontrolled components so manually controlled
	const [dateState, setDateState] = useState({
		startDateReset: 0,
		endDateReset: 0,
		startDate: searchParams.startDate,
		endDate: searchParams.endDate
	});

	const { form, handleChange, setForm } = useForm(searchParams || initialState.searchParams);
	// console.log(form);
	useUpdateEffect(() => {
		// Sync from leftSidebar to header
		const [_params, params] = parseSearchOptions(form);

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
		setForm(_.set({ ...form }, ev.target.name, ev.target.value));
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
		let array = [...form[name]];
		const newValue = value.trim();

		if (array === undefined || array[key] === undefined) {
			array.push([newValue]);
		} else if (array[key] !== undefined) {
			let newArrVal = [...array[key]];
			newArrVal.push(newValue);
			array = insert(array, key, newArrVal);
		} else if (array !== undefined) {
			array.push(newValue);
		}

		setForm(_.set({ ...form }, name, array));
		setSubmitted(true);
	}

	function handleDeleteChip(value, index, key, name) {
		let array = [...form[name]];

		if (key !== null) {
			// terms
			let newArrVal = [...array[key]];
			newArrVal.splice(index, 1);
			if (newArrVal.length === 0) {
				array.splice(key, 1);
			} else {
				array = insert(array, key, newArrVal);
			}
		} else {
			array.splice(index, 1); // not terms
		}
		setForm(_.set({ ...form }, name, array));
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
				analysisOptions: analysisOptions
			}
		};

		dispatch(setSearchLoading(true));
		dispatch(clearSearchs());
		dispatch(getSearchs(params)).then(() => {
			dispatch(getWordCloud(params));
			dispatch(getKeywords(params));
			dispatch(getMatrix(params));
			dispatch(getIndicator(params));
			dispatch(setSearchLoading(false));
			dispatch(setSearchSubmit(false));
		});

		setSubmitted(false);
	}

	function handleReset(name) {
		setDateState({ ...dateState, [name]: '', [`${name}Reset`]: `${name}Reset` + 1 });
		setForm(_.set({ ...form }, name, ''));
	}

	const defaultProps = {
		className: clsx(classes.root, 'w-full'),
		textFieldProps: {
			variant: 'outlined'
		},
		styles: {
			input: styles => ({
				...styles,
				minHeight: '34px'
			})
		}
	};

	return (
		<FuseScrollbars className="flex flex-auto flex-col min-h-2xl">
			<div className="px-24 py-8">
				<Typography variant="subtitle1">검색 범위</Typography>
				<FormControl component="fieldset" className={classes.formControl}>
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
							className={clsx(classes.root, 'input:', classes.chipInput)}
							placeholder=" or + Synonym"
							// clearInputValueOnChange={true}
							onAdd={chip => handleAddChip(chip, key, 'terms')}
							onDelete={(chip, index) => handleDeleteChip(chip, index, key, 'terms')}
							key={key}
						/>
					))}
				<ChipInput
					value={[]}
					fullWidth
					className={clsx(classes.root, 'input:', classes.chipInput)}
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
						className={clsx(classes.root, 'flex w-full')}
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
						className={clsx(classes.root, 'flex w-full')}
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
						className={classes.root}
						placeholder=" + 발명자"
						clearInputValueOnChange
						onAdd={chip => handleAddChip(chip, null, 'inventor')}
						onDelete={(chip, index) => handleDeleteChip(chip, index, null, 'inventor')}
						variant="outlined"
					/>
				</FormControl>
				<FormControl className="flex justify-center items-start">
					<ChipInput
						value={form.assignee}
						fullWidth
						className={classes.root}
						// label="용어 검색"
						placeholder=" + 출원인"
						onAdd={chip => handleAddChip(chip, null, 'assignee')}
						onDelete={(chip, index) => handleDeleteChip(chip, index, null, 'assignee')}
						variant="outlined"
					/>
				</FormControl>
				{/* <div className="flex justify-center items-start">
					<FuseChipSelect
						{...defaultProps}
						value={form.patentOffice.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'patentOffice')}
						placeholder="특허 기관"
						options={options.patentOffice.map(item => ({
							value: item,
							label: item
						}))}
						isMulti
					/>
				</div>
				<div className="flex justify-center items-start">
					<FuseChipSelect
						{...defaultProps}
						value={form.language.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'language')}
						placeholder="언어"
						options={options.language.map(item => ({
							value: item,
							label: item
						}))}
						isMulti
					/>
				</div> */}
				<div className="w-full">
					<FuseChipSelect
						{...defaultProps}
						value={form.status.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'status')}
						placeholder="상태"
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
						{...defaultProps}
						value={form.ipType.map(item => ({
							value: item,
							label: item
						}))}
						onChange={v => handleChipChange(v, 'ipType')}
						placeholder="종류"
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
