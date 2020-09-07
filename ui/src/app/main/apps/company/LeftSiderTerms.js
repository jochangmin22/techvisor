import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useUpdateEffect } from '@fuse/hooks';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import ChipInput from 'material-ui-chip-input';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { makeStyles } from '@material-ui/core/styles';
import _ from '@lodash';
import parseSearchOptions from 'app/main/apps/lib/parseParamsCompanyApp';
import {
	getSearchs,
	// getWordCloud,
	// getKeywords,
	// getMatrix,
	clearSearchs,
	clearSearchText,
	setSearchLoading,
	setSearchParams,
	setSearchSubmit,
	initialState
} from 'app/main/apps/company/store/searchsSlice';

// TODO: change focus next textField
// TODO: DnD word chip
const useStyles = makeStyles(theme => ({
	root: {
		// display: 'flex',
		// width: 'full',
		marginBottom: theme.spacing(2),
		backgroundColor: theme.palette.type === 'light' ? theme.palette.background.paper : theme.palette.primary.dark,
		'& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderWidth: 0
		},
		// '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
		// 	borderWidth: 2,
		// 	borderColor: 'red'
		// },
		'&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
			borderWidth: 1,
			borderColor: theme.palette.secondary.main
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderWidth: 2,
			borderColor: theme.palette.primary.main
		}
	}
}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const insert = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];

const tempObj = {
	'기업 이름': 'companyName',
	주소: 'companyAddress',
	'사업 영역': 'bizDomain',
	'관련 키워드': 'relatedKeyword',
	'사용자정의 검색 조건': 'customCriteria'
};

const LeftSiderTerms = React.forwardRef(function (props, ref) {
	const dispatch = useDispatch();
	const classes = useStyles();
	// const [searchVolume, setSearchVolume] = useState('SUM');

	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);
	const searchSubmit = useSelector(({ companyApp }) => companyApp.searchs.searchSubmit);

	const [submitted, setSubmitted] = useState(searchSubmit);

	// they were uncontrolled components so manually controlled
	const [singleState, setSingleState] = useState({
		companyNameReset: 0,
		companyAddressReset: 0,
		bizDomainReset: 0,
		relatedKeywordReset: 0,
		customCriteriaReset: 0,
		industryReset: 0,
		companyName: searchParams.companyName,
		companyAddress: searchParams.companyAddress,
		bizDomain: searchParams.bizDomain,
		relatedKeyword: searchParams.relatedKeyword,
		customCriteria: searchParams.customCriteria,
		industry: searchParams.industry
	});

	const [doubleState, setDoubleState] = useState({
		marketCapStartReset: 0,
		marketCapEndReset: 0,
		marketCapStart: searchParams.marketCapStart,
		marketCapEnd: searchParams.marketCapEnd,
		foundedStartReset: 0,
		foundedEndReset: 0,
		foundedStart: searchParams.foundedStart,
		foundedEnd: searchParams.foundedEnd,
		employeeStartReset: 0,
		employeeEndReset: 0,
		employeeStart: searchParams.employeeStart,
		employeeEnd: searchParams.employeeEnd,
		repAgeStartReset: 0,
		repAgeEndReset: 0,
		repAgeStart: searchParams.repAgeStart,
		repAgeEnd: searchParams.repAgeEnd
	});

	const { form, handleChange, setForm } = useForm(searchParams || initialState.searchParams);

	useUpdateEffect(() => {
		// Sync from leftSidebar to header
		const [_params, params] = parseSearchOptions(form);

		dispatch(setSearchParams(_params));

		if (submitted) {
			// onSearch(form);
			onSearch(params, form.searchNum);
		}

		// eslint-disable-next-line
	}, [form]);

	useUpdateEffect(() => {
		// Sync from header to leftSidebar
		setForm(searchParams);
		// Sync uncontrolled components
		setSingleState({
			...singleState,
			companyName: searchParams.companyName,
			companyAddress: searchParams.companyAddress,
			bizDomain: searchParams.bizDomain,
			relatedKeyword: searchParams.relatedKeyword,
			customCriteria: searchParams.customCriteria,
			industry: searchParams.industry
		});
		setDoubleState({
			...doubleState,
			marketCapStart: searchParams.marketCapStart,
			marketCapEnd: searchParams.marketCapEnd,
			foundedStart: searchParams.foundedStart,
			foundedEnd: searchParams.foundedEnd,
			employeeStart: searchParams.employeeStart,
			employeeEnd: searchParams.employeeEnd,
			repAgeStart: searchParams.repAgeStart,
			repAgeEnd: searchParams.repAgeEnd
		});
		setSubmitted(searchSubmit);
	}, [searchParams.searchText, searchParams.searchNum]);

	useEffect(() => {}, [dispatch]);

	React.useImperativeHandle(ref, () => {
		return {
			clearTerms() {
				dispatch(clearSearchText());
			}
		};
	});

	// function handleSingleChange(ev) {
	// 	const { value, name } = ev.target;
	// 	setSingleState({ ...singleState, [name]: value });
	// 	if ((value.length >= 2 && /^\D*$/.test(value)) || value.length === 0) {
	// 		if (form[name] !== value) {
	// 			setForm(_.set({ ...form }, name, value));
	// 		}
	// 	}
	// 	setSubmitted(true);
	// }

	function handleDateChange(ev) {
		const { value, name } = ev.target;
		setDoubleState({ ...doubleState, [name]: value });
		if ((value.length === 8 && /^\d+$/.test(value)) || value.length === 0) {
			if (form[name] !== value) {
				setForm(_.set({ ...form }, name, value));
			}
		}
		setSubmitted(true);
	}
	function handleDoubleChange(ev) {
		const { value, name } = ev.target;
		setDoubleState({ ...doubleState, [name]: value });
		if (/^\d+$/.test(value) || value.length === 0) {
			if (form[name] !== value) {
				setForm(_.set({ ...form }, name, value));
			}
		}
		setSubmitted(true);
	}

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

	function handleDeleteChip(index, name) {
		let array = [...form[name]];

		array.splice(index, 1);

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
			subParams: {}
		};

		dispatch(setSearchLoading(true));
		dispatch(clearSearchs());
		dispatch(getSearchs(params)).then(() => {
			// dispatch(getWordCloud(newApiParams));
			// dispatch(getKeywords(newApiParams));
			// dispatch(getMatrix(newApiParams));
			dispatch(setSearchLoading(false));
			dispatch(setSearchSubmit(false));
		});

		setSubmitted(false);
	}

	function handleReset(name) {
		setDoubleState({ ...doubleState, [name]: '', [`${name}Reset`]: `${name}Reset` + 1 });
		setForm(_.set({ ...form }, name, ''));
	}

	function clearIconAdornment(name) {
		return form[name]
			? {
					classes: {
						root: 'p-0',
						input: 'pl-14 pr-0'
					},
					endAdornment: (
						<InputAdornment position="end">
							<IconButton onClick={() => handleReset(name)} size="small">
								<Icon className="text-20" color="action">
									clear
								</Icon>
							</IconButton>
						</InputAdornment>
					)
			  }
			: {};
	}

	return (
		<FuseScrollbars className="flex flex-auto flex-col min-h-2xl">
			<div className="px-24 py-8">
				{Object.entries(tempObj).map(([key, value]) => (
					<div key={value}>
						<Typography variant="subtitle1">{key}</Typography>
						<FormControl className="flex justify-center items-start">
							<ChipInput
								value={form[value]}
								fullWidth
								className={classes.root}
								placeholder={` ${key}`}
								clearInputValueOnChange
								onAdd={chip => handleAddChip(chip, null, value)}
								onDelete={(chip, index) => handleDeleteChip(index, value)}
								variant="outlined"
							/>
						</FormControl>
					</div>
				))}
				<Typography variant="subtitle1" className="mt-8">
					산업
				</Typography>
				<Autocomplete
					multiple
					// id="industry"
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
							name="industry"
							variant="outlined"
							fullWidth
							className={classes.root}
							placeholder="산업"
						/>
					)}
				/>
				<Typography variant="subtitle1" className="mt-8">
					시가총액
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={doubleState.marketCapStartReset + 'marketCapStart'}
						name="marketCapStart"
						onChange={handleDoubleChange}
						value={doubleState.marketCapStart}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="From"
						error={
							!(
								form.marketCapStart &&
								form.marketCapStart.length === 8 &&
								/^\d+$/.test(form.marketCapStart)
							)
						}
						InputProps={clearIconAdornment('marketCapStart')}
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={doubleState.marketCapEndReset + 'marketCapEnd'}
						name="marketCapEnd"
						onChange={handleDoubleChange}
						value={doubleState.marketCapEnd}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="To"
						InputProps={clearIconAdornment('marketCapEnd')}
					/>
				</FormControl>
				<Typography variant="subtitle1" className="mt-8">
					설립일
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={doubleState.foundedStartReset + 'foundedStart'}
						name="foundedStart"
						onChange={handleDateChange}
						value={doubleState.foundedStart}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="YYYYMMDD"
						error={
							!(form.foundedStart && form.foundedStart.length === 8 && /^\d+$/.test(form.foundedStart))
						}
						InputProps={clearIconAdornment('foundedStart')}
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={doubleState.foundedEndReset + 'foundedEnd'}
						name="foundedEnd"
						onChange={handleDateChange}
						value={doubleState.foundedEnd}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="YYYYMMDD"
						InputProps={clearIconAdornment('foundedEnd')}
					/>
				</FormControl>
				<Typography variant="subtitle1" className="mt-8">
					종업원 수
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={doubleState.employeeStartReset + 'employeeStart'}
						name="employeeStart"
						onChange={handleDoubleChange}
						value={doubleState.employeeStart}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="From"
						error={
							!(form.employeeStart && form.employeeStart.length === 8 && /^\d+$/.test(form.employeeStart))
						}
						InputProps={clearIconAdornment('employeeStart')}
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={doubleState.employeeEndReset + 'employeeEnd'}
						name="employeeEnd"
						onChange={handleDoubleChange}
						value={doubleState.employeeEnd}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="To"
						InputProps={clearIconAdornment('employeeEnd')}
					/>
				</FormControl>
				<Typography variant="subtitle1" className="mt-8">
					대표이사 나이
				</Typography>
				<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
					<TextField
						key={doubleState.repAgeStartReset + 'repAgeStart'}
						name="repAgeStart"
						onChange={handleDoubleChange}
						value={doubleState.repAgeStart}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="From"
						error={!(form.repAgeStart && form.repAgeStart.length === 2 && /^\d+$/.test(form.repAgeStart))}
						InputProps={clearIconAdornment('repAgeStart')}
					/>
					<div className="flex w-full sm:w-8 py-20">-</div>
					<TextField
						key={doubleState.repAgeEndReset + 'repAgeEnd'}
						name="repAgeEnd"
						onChange={handleDoubleChange}
						value={doubleState.repAgeEnd}
						autoComplete="off"
						variant="outlined"
						className={classes.root}
						placeholder="To"
						InputProps={clearIconAdornment('repAgeEnd')}
					/>
				</FormControl>
			</div>
		</FuseScrollbars>
	);
});

export default LeftSiderTerms;
