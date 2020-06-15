import React, { useState } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import EnhancedTable from './components/EnhancedTable';
import { useSelector } from 'react-redux';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

function MatrixAnalysis(props) {
	const matrix = useSelector(({ companyApp }) => companyApp.searchs.matrix);

	const [selectedCategory, setSelectedCategory] = useState('기술별');

	function handleSelectedCategory(event) {
		setSelectedCategory(event.target.value);
	}

	const columns = React.useMemo(
		() =>
			matrix
				? [
						{
							Header: selectedCategory,
							accessor: selectedCategory,
							className: 'text-11'
						}
				  ].concat(
						Object.keys(matrix).map(item => ({
							Header: item,
							accessor: item,
							className: 'text-11'
						}))
				  )
				: [
						{
							Header: selectedCategory,
							accessor: selectedCategory,
							className: 'text-11'
						}
				  ],
		// eslint-disable-next-line
		[matrix, selectedCategory]
	);

	const groupBy = (obj, selectedCategory) => {
		const keys = Object.keys(obj);
		const mapping = keys.reduce((acc, k) => {
			obj[k].forEach(item => {
				Object.keys(item).forEach(yearKey => {
					var tracked = acc[yearKey];
					if (!tracked) {
						acc[yearKey] = {
							// year: yearKey
							[selectedCategory]: yearKey
						};
					}
					acc[yearKey][k] = (acc[yearKey][k] | 0) + item[yearKey];
				});
			});
			return acc;
		}, {});
		return Object.values(mapping);
	};

	const data = React.useMemo(() => (matrix ? groupBy(matrix, selectedCategory) : []), [matrix, selectedCategory]);

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full rounded-8 shadow">
			<div className="px-12 flex items-center">
				<PopoverMsg
					title="매트릭스 분석"
					msg="검색결과에서 의미 있는 핵심 주제어를 추출하고, 국가별, 연도별, 기술별, 기업별 분석을 매트릭스 형태로 표시합니다."
				/>
				<FormControl>
					<Select
						className="w-128 px-12"
						value={selectedCategory}
						onChange={handleSelectedCategory}
						// inputProps={{
						// 	name: 'selectedCategory'
						// }}
						displayEmpty
						// disableUnderline
					>
						{['국가별', '연도별', '기술별', '기업별'].map((key, n) => (
							<MenuItem value={key} key={key}>
								{key}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>
			<FuseScrollbars className="flex flex-col h-44 px-12 flex-no-overflow items-center overflow-x-auto">
				<div className="flex w-full ">
					{matrix && <Chip label={selectedCategory} key={selectedCategory} size="small" className="mx-4" />}
					{matrix &&
						Object.entries(matrix).map(([key]) => (
							// <Chip label={value} key={value} size="small" onClick={() => handleClick(value)} />
							// <Draggable>
							<Chip label={key} key={key} size="small" className="mx-4" />
							// </Draggable>
						))}
				</div>
			</FuseScrollbars>
			<EnhancedTable
				columns={columns}
				data={data}
				size="small"
				onRowClick={(ev, row) => {
					if (row) {
						// window.open(row.original.link, '_blank');
						// props.history.push(row.original.link);
						// dispatch(Actions.openEditContactDialog(row.original));
					}
				}}
			/>
		</Paper>
	);
}

export default MatrixAnalysis;
