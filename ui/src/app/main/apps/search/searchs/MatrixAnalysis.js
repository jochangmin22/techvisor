import React, { useState, useEffect } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from '../store/actions';
// import { Draggable } from 'react-beautiful-dnd';
// import Draggable from 'react-draggable';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import parseSearchText from '../inc/parseSearchText';
import MatrixDialog from './MatrixDialog';

function MatrixAnalysis(props) {
	const dispatch = useDispatch();
	const matrix = useSelector(({ searchApp }) => searchApp.searchs.matrix);
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const [selectedCategory, setSelectedCategory] = useState(matrix.category);
	const [showLoading, setShowLoading] = useState(false);

	function handleSelectedCategory(event) {
		setSelectedCategory(event.target.value);
	}

	// const { setShowLoading } = useContext(SubjectContext);

	useEffect(() => {
		if (selectedCategory) {
			const [, newApiParams] = parseSearchText(searchParams, null);
			newApiParams.category = selectedCategory;
			setShowLoading(true);
			dispatch(Actions.getMatrix(newApiParams)).then(() => {
				setShowLoading(false);
			});
		}
	}, [dispatch, searchParams, selectedCategory]);

	// const defaultColumn = React.useMemo(
	// 	() => ({
	// 		width: 80
	// 	}),
	// 	[]
	// );

	const columns = React.useMemo(() => {
		function getColor(value) {
			const hue = matrix.max && value ? (value / matrix.max).toFixed(1) * 10 : 0;
			if (hue === 0) {
				return 'font-normal text-blue-100';
			} else if (hue > 0 && hue < 10) {
				return 'font-normal text-blue-' + hue * 100;
			} else if (hue === 10) {
				return 'font-extrabold text-blue-900 text-12';
			}
		}

		function onCellClick(ev, props) {
			ev.preventDefault();

			const [, newApiParams] = parseSearchText(searchParams, null);
			newApiParams.category = selectedCategory;
			newApiParams.topic = props.column.id;
			newApiParams.categoryValue = Object.values(props.row.values)[0];
			dispatch(Actions.getMatrixDialog(newApiParams)).then(() => {
				dispatch(Actions.openMatrixDialog());
			});
		}

		return matrix.entities
			? [
					{
						Header: selectedCategory,
						accessor: selectedCategory,
						className: 'text-14 text-left max-w-96 overflow-hidden',
						sortable: true,
						Cell: props => (
							<div onClick={ev => onCellClick(ev, props.cell)}>
								<span title={props.cell.value}>{props.cell.value}</span>
							</div>
						)
					}
			  ].concat(
					Object.keys(matrix.entities).map(item => ({
						Header: item,
						accessor: item,
						className: 'text-11 text-center',
						sortable: true,
						// onClick: () => {
						// 	alert('click!');
						// },
						Cell: props => {
							return (
								<div onClick={ev => onCellClick(ev, props.cell)} className={getColor(props.cell.value)}>
									<span title={props.cell.value}>{props.cell.value}</span>
								</div>
							);
						}
					}))
			  )
			: [
					{
						Header: selectedCategory,
						accessor: selectedCategory,
						className: 'text-11 text-center',
						sortable: true
					}
			  ];
	}, [dispatch, searchParams, matrix.max, matrix.entities, selectedCategory]);

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

	const data = React.useMemo(() => (matrix.entities ? groupBy(matrix.entities, selectedCategory) : []), [
		matrix.entities,
		selectedCategory
	]);

	// const data = React.useMemo(
	// 	() =>
	// 		matrix
	// 			?
	//             // firstCol
	//             [
	// 				{'연도별': '2008', '바이러스': 1, '단백질' : 2, '치료' : 2, '세포': 1,'감염': 1, '조성물': 3, '유전자' : 11, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2009', '바이러스': 5, '단백질' : 4, '치료' : 3, '세포': 2,'감염': 3, '조성물': 4, '유전자' : 12, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2010', '바이러스': 3, '단백질' : 5, '치료' : 5, '세포': 3,'감염': 2, '조성물': 5, '유전자' : 14, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2011', '바이러스': 2, '단백질' : 6, '치료' : 6, '세포': 7,'감염': 3, '조성물': 6, '유전자' : 12, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2012', '바이러스': 11, '단백질' : 7, '치료' : 7, '세포': 8,'감염': 1, '조성물': 7, '유전자' : 16, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2013', '바이러스': 13, '단백질' : 1, '치료' : 3, '세포': 9,'감염': 2, '조성물': 1, '유전자' : 2, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2014', '바이러스': 4, '단백질' : 3, '치료' : 1, '세포': 1,'감염': 4, '조성물': 2, '유전자' : 1, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2015', '바이러스': 2, '단백질' : 5, '치료' : 6, '세포': 9,'감염': 3, '조성물': 3, '유전자' : 5, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 				{'연도별': '2016', '바이러스': 7, '단백질' : 2, '치료' : 8, '세포': 3,'감염': 2, '조성물': 4, '유전자' : 2, '예방' : 5, '질환' : 7, '발현' : 8, '면역' : 10, '벡터' : 3, '백신' : 5, '항원' : 6, '항체' : 2, '재조합' : 7, '서열' : 2, '결합' : 7, '활성' :10, '반응': 12},
	// 			]
	//             // Object.entries(matrix)
	// 			// 		.map(e => ({ [e[0]]: e[1] }))
	// 			// 		.map((key, index) => {
	// 			// 			var container = key.reduce(
	// 			// 				(obj, item) => Object.assign(obj, { [item.key]: item.value }),
	// 			// 				{}
	// 			// 			);

	// 			// 			// value.map((k,v) => {
	// 			// 			// 	return =
	// 			// 			// })
	// 			// 		})
	//             // Object.entries(matrix)
	// 			// 		.map(e => ({ [e[0]]: e[1] }))
	// 			// 		.map((key, index) => {
	// 			// 			var container = key.reduce(
	// 			// 				(obj, item) => Object.assign(obj, { [item.key]: item.value }),
	// 			// 				{}
	// 			// 			);
	// 			// 			console.log('container', container);

	// 			// 			// value.map((k,v) => {
	// 			// 			// 	return =
	// 			// 			// })
	// 			// 		})
	// 			: // Object.entries(matrix).map(([key,value]) => {
	// 			  // 		// const container = {};
	// 			  // 		// var arr = [
	// 			  // 		// 	{ key: '11', value: '1100' },
	// 			  // 		// 	{ key: '22', value: '2200' }
	// 			  // 		// ];
	// 			  // 		var container = value.reduce((obj, item) => Object.assign(obj, { [item.key]: item.value }), {});
	// 			  // 		console.log('MatrixAnalysis -> container', container);

	// 			  // 		// newValue.map((key, value) => {
	// 			  // 		// 	container[keym] = value;
	// 			  // 		// });
	// 			  // 		return container;
	// 			  //   })
	// 			  [],
	// 	[matrix, selectedCategory]
	// );

	if (!data || data.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full rounded-8 shadow">
			<div className="px-12 flex items-center">
				<PopoverMsg
					title="매트릭스 분석"
					msg="검색결과에서 의미 있는 핵심 주제어를 추출하고, 연도별, 기술별, 기업별 분석을 매트릭스 형태로 표시합니다."
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
						{['연도별', '기술별', '기업별'].map(key => (
							<MenuItem value={key} key={key}>
								{key}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>
			<FuseScrollbars className="h-40 px-12">
				<div className="flex w-full ">
					{/* {matrix.entities && (
						<Chip label={selectedCategory} key={selectedCategory} size="small" className="mx-4" />
					)} */}
					{matrix.entities &&
						Object.entries(matrix.entities).map(([key]) => (
							// <Chip label={value} key={value} size="small" onClick={() => handleClick(value)} />
							// <Draggable>
							<Chip label={key} key={key} size="small" className="mx-4" />
							// </Draggable>
						))}
				</div>
			</FuseScrollbars>
			{showLoading ? (
				<SpinLoading />
			) : (
				<>
					<FuseScrollbars className="max-h-360 px-6">
						<EnhancedTable
							columns={columns}
							// defaultColumn={defaultColumn}
							data={data}
							size="small"
							pageSize={8}
							pageOptions={[8, 16, 24]}
							onRowClick={(ev, row) => {
								if (row) {
									// window.open(row.original.link, '_blank');
									// props.history.push(row.original.link);
									// dispatch(Actions.openEditContactDialog(row.original));
								}
							}}
						/>
					</FuseScrollbars>
					<MatrixDialog />
				</>
			)}
		</Paper>
	);
}

export default MatrixAnalysis;
