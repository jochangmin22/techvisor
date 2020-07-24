import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import IndicatorTable from './components/IndicatorTable';
import CrossAnalysisA from './components/CrossAnalysisA';
import CrossAnalysisB from './components/CrossAnalysisB';
import Button from '@material-ui/core/Button';

function IndicatorAnalysis(props) {
	const { searchText, inventor, assignee } = props;
	const [selectedCategory, setSelectedCategory] = useState('출원인별');
	const [currentRange, setCurrentRange] = useState(0);

	function handleSelectedCategory(event) {
		setSelectedCategory(event.target.value);
	}

	function handleChangeRange(range) {
		setCurrentRange(range);
	}

	const isEmpty = !!(!searchText && !inventor && !assignee);

	useEffect(() => {}, [props]);

	return (
		<>
			<div className="flex items-center justify-between px-8">
				<FormControl>
					<Select
						className="w-128 px-12"
						value={selectedCategory}
						onChange={handleSelectedCategory}
						displayEmpty
					>
						{['출원인별', '국가별', '특허기관별', '연도별'].map(key => (
							<MenuItem value={key} key={key}>
								{key}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<div className="items-center">
					{['교차분석 I', '교차분석 II', '종합'].map((key, index) => {
						return (
							<Button
								key={index}
								className="normal-case shadow-none px-16"
								onClick={() => handleChangeRange(index)}
								color={currentRange === index ? 'default' : 'disabled'}
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
						<EmptyMsg icon="photo" msg="CPP, PII, TS 및 PFS 교차분석" />
					) : (
						<div className="flex w-full">
							<CrossAnalysisA searchText={searchText} />
						</div>
					))}
				{currentRange === 1 &&
					(isEmpty ? (
						<EmptyMsg icon="layers" msg="피인용도지수(CPP)-시장확보지수(PFS) 교차분석" />
					) : (
						<div className="flex w-full">
							<CrossAnalysisB searchText={searchText} />
						</div>
					))}
				{currentRange === 2 &&
					(isEmpty ? (
						<EmptyMsg icon="text_fields" msg="지표분석 종합" />
					) : (
						<IndicatorTable searchText={searchText} />
					))}
			</div>
		</>
	);
}

export default IndicatorAnalysis;
