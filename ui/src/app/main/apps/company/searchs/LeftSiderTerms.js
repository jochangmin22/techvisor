/* eslint-disable */
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
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import FuseChipSelect from '@fuse/core/FuseChipSelect';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import ChipInput from 'material-ui-chip-input';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import _ from '@lodash';
import LeftConfig from './setLeftConfig';
import parseSearchText from 'app/main/apps/lib/parseSearchText';
import * as Actions from '../store/actions';

// FIXME : make date TextField to uncontrolled
// TODO: change focus next textField
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

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const LeftSiderTerms = React.forwardRef(function (props, ref) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const { options, defaultFormValue } = LeftConfig;
	const [searchVolume, setSearchVolume] = useState('SUM');

	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);
	const searchSubmit = useSelector(({ companyApp }) => companyApp.searchs.searchSubmit);

	const [submitted, setSubmitted] = useState(searchSubmit);

	// startDate, endDate were uncontrolled components so manually controlled
	const [dateState, setDateState] = useState({
		startDateReset: 0,
		endDateReset: 0,
		startDate: searchParams.employeeStartDate,
		endDate: searchParams.employeeEndDate
	});

	const { form, handleChange, setForm } = useForm(searchParams ? { ...searchParams } : { ...defaultFormValue });

	useUpdateEffect(() => {
		// Sync from leftSidebar to header
		const [newParams, newApiParams] = parseSearchOptions(form);

		dispatch(setSearchParams(newParams));

		if (submitted) {
			// onSearch(form);
			onSearch(newApiParams, form.searchNum);
		}
		// eslint-disable-next-line
	}, [form]);

	useUpdateEffect(() => {
		// Sync from header to leftSidebar
		setForm(searchParams);
		setDateState({
			...dateState,
			employeeStartDate: searchParams.employeeStartDate,
			employeeEndDate: searchParams.employeeEndDate
		});
		setSubmitted(searchSubmit);
	}, [searchParams.searchText, searchParams.searchNum]);

	useEffect(() => {}, [dispatch]);

	React.useImperativeHandle(ref, () => {
		return {
			clearTerms() {
				dispatch(clearSearchText());
				setForm({ ...defaultFormValue });
				setDateState({ ...dateState, startDate: '', endDate: '' });
				setSearchVolume('SUM');
				setSubmitted(searchSubmit);
			}
		};
	});

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

	function onSearch(newApiParams, num = '') {
		// check if newApiParams is empty
		if (Object.keys(newApiParams).every(k => newApiParams[k] === '')) {
			return;
		}
		newApiParams['searchVolume'] = searchVolume;

		dispatch(setSearchLoading(true));
		dispatch(clearSearchs());
		if (num === '') {
			dispatch(getSearchs(newApiParams)).then(() => {
				// dispatch(getWordCloud(newApiParams));
				// dispatch(getSubjectRelation(newApiParams));
				// dispatch(getMatrix(newApiParams));
				dispatch(setSearchLoading(false));
				dispatch(setSearchSubmit(false));
			});
		} else {
			dispatch(getSearchsNum({ searchNum: num })).then(() => {
				// dispatch(getWordCloud({ searchNum: num }));
				// dispatch(getSubjectRelation({ searchNum: num }));
				// dispatch(getMatrix(newApiParams));
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
				<Typography variant="subtitle1" className="mt-8">
					기업 이름
				</Typography>
				<Autocomplete
					freeSolo
					id="companyName"
					disableClearable
					options={[]}
					renderInput={params => (
						<TextField
							{...params}
							// label="Search input"
							margin="normal"
							variant="outlined"
							fullWidth
							name="companyName"
							onKeyPress={ev => {
								if (ev.ctrlKey && ev.key === 'Enter') {
									this.props.addHandler();
								}
							}}
							// onChange={handleChange}
							className={clsx(classes.root, classes.customBg, 'flex w-full')}
							InputProps={{ ...params.InputProps, type: 'search' }}
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					주소
				</Typography>
				<Autocomplete
					freeSolo
					id="companyAddress"
					disableClearable
					options={[]}
					renderInput={params => (
						<TextField
							{...params}
							// label="Search input"
							margin="normal"
							variant="outlined"
							fullWidth
							name="companyAddress"
							onChange={handleChange}
							className={clsx(classes.root, classes.customBg, 'flex w-full')}
							InputProps={{ ...params.InputProps, type: 'search' }}
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					사업 영역
				</Typography>
				<Autocomplete
					freeSolo
					id="bizDomain"
					disableClearable
					options={[]}
					renderInput={params => (
						<TextField
							{...params}
							// label="Search input"
							margin="normal"
							variant="outlined"
							fullWidth
							name="bizDomain"
							onChange={handleChange}
							className={clsx(classes.root, classes.customBg, 'flex w-full')}
							InputProps={{ ...params.InputProps, type: 'search' }}
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					관련 키워드
				</Typography>
				<Autocomplete
					freeSolo
					id="relatedKeyword"
					disableClearable
					options={[]}
					renderInput={params => (
						<TextField
							{...params}
							// label="Search input"
							margin="normal"
							variant="outlined"
							fullWidth
							name="relatedKeyword"
							onChange={handleChange}
							className={clsx(classes.root, classes.customBg, 'flex w-full')}
							InputProps={{ ...params.InputProps, type: 'search' }}
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					사용자정의 검색 조건
				</Typography>
				<Autocomplete
					freeSolo
					id="customCriteria"
					disableClearable
					options={[]}
					renderInput={params => (
						<TextField
							{...params}
							// label="Search input"
							margin="normal"
							variant="outlined"
							fullWidth
							name="customCriteria"
							onChange={handleChange}
							className={clsx(classes.root, classes.customBg, 'flex w-full')}
							InputProps={{ ...params.InputProps, type: 'search' }}
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					산업
				</Typography>
				<Autocomplete
					multiple
					id="industry"
					options={[]}
					disableCloseOnSelect
					getOptionLabel={option => option.title}
					renderOption={(option, { selected }) => (
						<React.Fragment>
							<Checkbox
								icon={icon}
								checkedIcon={checkedIcon}
								style={{ marginRight: 8 }}
								checked={selected}
							/>
							{option.title}
						</React.Fragment>
					)}
					// style={{ width: 500 }}
					renderInput={params => (
						<TextField
							{...params}
							variant="outlined"
							fullWidth
							className={clsx(classes.root, classes.customBg, 'flex w-full')}
							placeholder="산업"
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					시가총액
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={dateState.startDateReset + 'marketCapStart'}
						name="marketCapStart"
						onChange={handleDateChange}
						value={dateState.startDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="From"
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
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={dateState.endDateReset + 'marketCapStartEnd'}
						name="marketCapStartEnd"
						onChange={handleDateChange}
						value={dateState.endDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="To"
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
				<Typography variant="subtitle1" className="mt-8">
					설립일
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={dateState.startDateReset + 'foundedStartDate'}
						name="foundedStartDate"
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
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={dateState.endDateReset + 'foundedEndDate'}
						name="foundedEndDate"
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
				<Typography variant="subtitle1" className="mt-8">
					종업원 수
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={dateState.startDateReset + 'employeeStart'}
						name="employeeStart"
						onChange={handleDateChange}
						value={dateState.startDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="From"
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
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={dateState.endDateReset + 'employeeEnd'}
						name="employeeEnd"
						onChange={handleDateChange}
						value={dateState.endDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="To"
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
				<Typography variant="subtitle1" className="mt-8">
					대표이사 나이
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={dateState.startDateReset + 'repAgeStart'}
						name="repAgeStart"
						onChange={handleDateChange}
						value={dateState.startDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="From"
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
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={dateState.endDateReset + 'repAgeEnd'}
						name="repAgeEnd"
						onChange={handleDateChange}
						value={dateState.endDate}
						autoComplete="off"
						variant="outlined"
						className={clsx(classes.root, classes.customBg, 'flex w-full')}
						placeholder="To"
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
			</div>
		</FuseScrollbars>
	);
});

export default LeftSiderTerms;
