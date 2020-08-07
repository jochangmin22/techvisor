import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import IndicatorTable from './components/IndicatorTable';
import CrossAnalysisA from './components/CrossAnalysisA';
import CrossAnalysisB from './components/CrossAnalysisB';
import Button from '@material-ui/core/Button';
import { getIndicator } from '../../store/searchsSlice';
import { useDispatch, useSelector } from 'react-redux';
import parseSearchText from 'app/main/apps/lib/parseSearchText';

function IndicatorAnalysis(props) {
	const dispatch = useDispatch();
	const { searchText, searchNum, inventor, assignee } = props;
	const [selectedCategory, setSelectedCategory] = useState('출원인별');

	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	// const [showLoading, setShowLoading] = useState(false);
	const [currentRange, setCurrentRange] = useState(0);

	function handleSelectedCategory(event) {
		setSelectedCategory(event.target.value);
	}

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	const isEmpty = !!(!searchText && !searchNum && !inventor && !assignee);

	useEffect(() => {
		// setShowLoading(true);
		const [, params] = parseSearchText(searchParams, null);
		const subParams = { analysisOptions: analysisOptions };
		dispatch(getIndicator({ params, subParams })).then(() => {
			// setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [dispatch, searchParams, analysisOptions.indicatorOptions]);

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-col w-full sm:flex-row justify-between sm:px-8">
				<FormControl className="flex w-full sm:w-128 mb-16 sm:mb-0 px-12">
					<Select value={selectedCategory} onChange={handleSelectedCategory} displayEmpty>
						{['출원인별', '국가별', '특허기관별', '연도별'].map(key => (
							<MenuItem value={key} key={key}>
								{key}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<div className="flex w-full sm:w-320 mx-16 px-12 items-center">
					{['기술력분석 I', '기술력분석 II', '종합'].map((key, index) => {
						return (
							<Button
								key={index}
								className="normal-case shadow-none px-16"
								onClick={() => handleChangeRange(index)}
								color={currentRange === index ? 'default' : 'inherit'}
								variant={currentRange === index ? 'contained' : 'text'}
								size="small"
							>
								{key}
							</Button>
						);
					})}
				</div>
			</div>
			<div className="flex flex-row flex-wrap">
				{currentRange === 0 &&
					(isEmpty ? (
						<EmptyMsg icon="photo" msg="CPP, PII, TS 및 PFS 경쟁력분석" />
					) : (
						<div className="flex w-full">
							<CrossAnalysisA searchText={searchText} />
						</div>
					))}
				{currentRange === 1 &&
					(isEmpty ? (
						<EmptyMsg icon="layers" msg="피인용도지수(CPP)-시장확보지수(PFS) 경쟁력분석" />
					) : (
						<div className="flex w-full">
							<CrossAnalysisB searchText={searchText} />
						</div>
					))}
				{currentRange === 2 &&
					(isEmpty ? (
						<EmptyMsg icon="text_fields" msg="지표분석 종합" />
					) : (
						<div className="flex w-full">
							<IndicatorTable searchText={searchText} />
						</div>
					))}
			</div>
		</div>
	);
}

export default IndicatorAnalysis;
