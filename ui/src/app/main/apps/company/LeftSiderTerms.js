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
import { makeStyles } from '@material-ui/core/styles';
import _ from '@lodash';
import clsx from 'clsx';
import parseSearchOptions from 'app/main/apps/lib/parseParamsCompany';
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
	},
	chipInput: {
		paddingRight: theme.spacing(1)
	}
}));

const insert = (arr, index, newItem) => [...arr.slice(0, index), newItem, ...arr.slice(index + 1)];

const tempObj = {
	업종: 'bizDomain',
	주요제품: 'relatedKeyword'
};
const tempDoubleObj = {
	시가총액: 'marketCap',
	'PER(%)': 'per',
	'PBR(배)': 'pbr',
	'EPS(원)': 'eps',
	'ROE(%)': 'roe',
	'ROA(%)': 'roa',
	'현재가(원)': 'nowPrice',
	'영업이익(전전분기)': 'operatingProfitDPQ',
	'당기순이익증감(전전분기)': 'netIncomeDPQ',
	'영업이익(전분기)': 'operatingProfitPQ',
	'당기순이익증감(전분기)': 'netIncomePQ'
};

const LeftSiderTerms = React.forwardRef(function (props, ref) {
	const dispatch = useDispatch();
	const classes = useStyles();
	// const [searchVolume, setSearchVolume] = useState('SUM');

	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);
	const searchSubmit = useSelector(({ companyApp }) => companyApp.searchs.searchSubmit);

	const [submitted, setSubmitted] = useState(searchSubmit);

	const [companyNameRowCount, setCompanyNameRowCount] = useState(0);

	// they were uncontrolled components so manually controlled
	const [singleState, setSingleState] = useState({
		bizDomainReset: 0,
		relatedKeywordReset: 0,
		companyName: searchParams.companyName,
		bizDomain: searchParams.bizDomain,
		relatedKeyword: searchParams.relatedKeyword
	});

	const [doubleState, setDoubleState] = useState({
		marketCapStartReset: 0,
		marketCapEndReset: 0,
		perStartReset: 0,
		perEndReset: 0,
		pbrStartReset: 0,
		pbrEndReset: 0,
		epsStartReset: 0,
		epsEndReset: 0,
		roeStartReset: 0,
		roeEndReset: 0,
		roaStartReset: 0,
		roaEndReset: 0,
		nowPriceStartReset: 0,
		nowPriceEndReset: 0,
		operatingProfitDPQStartReset: 0,
		operatingProfitDPQEndReset: 0,
		netIncomeDPQStartReset: 0,
		netIncomeDPQEndReset: 0,
		operatingProfitPQStartReset: 0,
		operatingProfitPQEndReset: 0,
		netIncomePQStartReset: 0,
		netIncomePQEndReset: 0,
		marketCapStart: searchParams.marketCapStart,
		marketCapEnd: searchParams.marketCapEnd,
		perStart: searchParams.perStart,
		perEnd: searchParams.perEnd,
		pbrStart: searchParams.pbrStart,
		pbrEnd: searchParams.pbrEnd,
		epsStart: searchParams.epsStart,
		epsEnd: searchParams.epsEnd,
		roeStart: searchParams.roeStart,
		roeEnd: searchParams.roeEnd,
		roaStart: searchParams.roaStart,
		roaEnd: searchParams.roaEnd,
		nowPriceStart: searchParams.nowPriceStart,
		nowPriceEnd: searchParams.nowPriceEnd,
		operatingProfitDPQStart: searchParams.operatingProfitDPQStart,
		operatingProfitDPQEnd: searchParams.operatingProfitDPQEnd,
		netIncomeDPQStart: searchParams.netIncomeDPQStart,
		netIncomeDPQEnd: searchParams.netIncomeDPQEnd,
		operatingProfitPQStart: searchParams.operatingProfitPQStart,
		operatingProfitPQEnd: searchParams.operatingProfitPQEnd,
		netIncomePQStart: searchParams.netIncomePQStart,
		netIncomePQEnd: searchParams.netIncomePQEnd
	});

	const { form, setForm } = useForm(searchParams || initialState.searchParams);

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
			bizDomain: searchParams.bizDomain,
			relatedKeyword: searchParams.relatedKeyword
		});

		setDoubleState({
			...doubleState,
			marketCapStart: searchParams.marketCapStart,
			marketCapEnd: searchParams.marketCapEnd,
			perStart: searchParams.perStart,
			perEnd: searchParams.perEnd,
			pbrStart: searchParams.pbrStart,
			pbrEnd: searchParams.pbrEnd,
			epsStart: searchParams.epsStart,
			epsEnd: searchParams.epsEnd,
			roeStart: searchParams.roeStart,
			roeEnd: searchParams.roeEnd,
			roaStart: searchParams.roaStart,
			roaEnd: searchParams.roaEnd,
			nowPriceStart: searchParams.nowPriceStart,
			nowPriceEnd: searchParams.nowPriceEnd,
			operatingProfitDPQStart: searchParams.operatingProfitDPQStart,
			operatingProfitDPQEnd: searchParams.operatingProfitDPQEnd,
			netIncomeDPQStart: searchParams.netIncomeDPQStart,
			netIncomeDPQEnd: searchParams.netIncomeDPQEnd,
			operatingProfitPQStart: searchParams.operatingProfitPQStart,
			operatingProfitPQEnd: searchParams.operatingProfitPQEnd,
			netIncomePQStart: searchParams.netIncomePQStart,
			netIncomePQEnd: searchParams.netIncomePQEnd
		});
		setSubmitted(searchSubmit);
	}, [searchParams.searchText, searchParams.searchNum]);

	useEffect(() => {}, [dispatch]);

	useEffect(() => {
		setCompanyNameRowCount(form.companyName && form.companyName.length > 0 ? form.companyName.length : 0);
	}, [form]);

	React.useImperativeHandle(ref, () => {
		return {
			clearTerms() {
				dispatch(clearSearchText());
			}
		};
	});

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

	function handleDeleteChip(index, key, name) {
		let array = [...form[name]];

		if (key !== null) {
			// companyName
			let newArrVal = [...array[key]];
			newArrVal.splice(index, 1);
			if (newArrVal.length === 0) {
				array.splice(key, 1);
			} else {
				array = insert(array, key, newArrVal);
			}
		} else {
			array.splice(index, 1); // not companyName
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
			subParams: {}
		};

		dispatch(setSearchLoading(true));
		dispatch(clearSearchs());
		dispatch(getSearchs(params)).then(() => {
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
				<div>
					<Typography variant="subtitle1" className="mb-8">
						회사명
					</Typography>
					{form.companyName &&
						form.companyName.length > 0 &&
						form.companyName.map((value, key) => (
							<ChipInput
								value={value}
								fullWidth
								variant="outlined"
								className={clsx(classes.root, 'input:', classes.chipInput)}
								placeholder=" or 회사명"
								onAdd={chip => handleAddChip(chip, key, 'companyName')}
								onDelete={(chip, index) => handleDeleteChip(index, key, 'companyName')}
								key={key}
							/>
						))}
					<ChipInput
						value={[]}
						fullWidth
						variant="outlined"
						className={clsx(classes.root, 'input:', classes.chipInput)}
						placeholder=" or 회사명"
						onAdd={chip => handleAddChip(chip, companyNameRowCount, 'companyName')}
						onDelete={(chip, index) => handleDeleteChip(index, companyNameRowCount, 'companyName')}
						key={companyNameRowCount}
					/>
				</div>
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
								onDelete={(chip, index) => handleDeleteChip(index, null, value)}
								variant="outlined"
							/>
						</FormControl>
					</div>
				))}
				{Object.entries(tempDoubleObj).map(([key, value]) => (
					<div key={value}>
						<Typography variant="subtitle1" className="mt-8">
							{key}
						</Typography>
						<FormControl className="flex flex-col sm:flex-row flex-grow-0 flex-shrink-0 items-between justify-center">
							<TextField
								key={doubleState[value + 'StartReset'] + value + 'Start'}
								name={value + 'Start'}
								onChange={handleDoubleChange}
								value={doubleState[value + 'Start']}
								autoComplete="off"
								variant="outlined"
								className={classes.root}
								placeholder="From"
								error={
									!(
										form[value + 'Start'] &&
										form[value + 'Start'].length === 8 &&
										/^\d+$/.test(form[value + 'Start'])
									)
								}
								InputProps={clearIconAdornment(value + 'Start')}
							/>
							<div className="flex w-full sm:w-8 py-20">-</div>
							<TextField
								key={doubleState[value + 'EndReset'] + value + 'End'}
								name={value + 'End'}
								onChange={handleDoubleChange}
								value={doubleState[value + 'End']}
								autoComplete="off"
								variant="outlined"
								className={classes.root}
								placeholder="To"
								InputProps={clearIconAdornment(value + 'End')}
							/>
						</FormControl>
					</div>
				))}
			</div>
		</FuseScrollbars>
	);
});

export default LeftSiderTerms;
