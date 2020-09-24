import React, { useState, useEffect } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import { useSelector, useDispatch } from 'react-redux';
import { getClinicTest } from 'app/main/apps/company/store/searchsSlice';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import Paper from '@material-ui/core/Paper';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
// import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
// import MatrixAnalysisMenu from '../MatrixAnalysisMenu';

function ClinicTest() {
	const dispatch = useDispatch();
	const clinicTest = useSelector(({ companyApp }) => companyApp.searchs.clinicTest);
	const clinicOptions = useSelector(({ companyApp }) => companyApp.searchs.clinicOptions);
	const companyInfo = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);
	const { 업체명: corpName } = companyInfo;
	const { category } = clinicOptions;
	const [showLoading, setShowLoading] = useState(false);

	useEffect(() => {
		setShowLoading(true);
		dispatch(getClinicTest(corpName)).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [corpName]);

	const columns = React.useMemo(() => {
		// function getColor(value) {
		// 	const hue = clinicTest.max && value ? (value / clinicTest.max).toFixed(1) * 10 : 0;
		// 	if (hue === 0) {
		// 		return 'font-normal text-blue-100';
		// 	} else if (hue > 0 && hue < 10) {
		// 		return 'font-normal text-blue-' + hue * 100;
		// 	} else if (hue === 10) {
		// 		return 'font-extrabold text-blue-900 text-12';
		// 	}
		// }

		// function onCellClick(ev, props) {
		// 	ev.preventDefault();

		// 	const [, params] = parseSearchOptions(searchParams);
		// 	params.topic = props.column.id;
		// 	params.categoryValue = Object.values(props.row.values)[0];
		// 	const subParams = { clinicOptions: clinicOptions };
		// 	dispatch(getMatrixDialog({ params, subParams })).then(() => {
		// 		dispatch(openMatrixDialog());
		// 	});
		// }

		return clinicTest.entities
			? [
					{
						Header: category,
						accessor: category,
						className: 'text-14 text-left max-w-96 overflow-hidden',
						sortable: true
						// Cell: props => (
						// 	<div onClick={ev => onCellClick(ev, props.cell)}>
						// 		<span title={props.cell.value}>{props.cell.value}</span>
						// 	</div>
						// )
					}
			  ].concat(
					Object.keys(clinicTest.entities).map(item => ({
						Header: item,
						accessor: item,
						className: 'text-11 text-center',
						sortable: true
						// onClick: () => {
						// 	alert('click!');
						// },
						// Cell: props => {
						// 	return (
						// 		<div onClick={ev => onCellClick(ev, props.cell)} className={getColor(props.cell.value)}>
						// 			<span title={props.cell.value}>{props.cell.value}</span>
						// 		</div>
						// 	);
						// }
					}))
			  )
			: [
					{
						Header: category,
						accessor: category,
						className: 'text-11 text-center',
						sortable: true
					}
			  ];
		// }, [dispatch, searchParams, clinicTest, category]);
		// eslint-disable-next-line
	}, [clinicTest, category]);

	const groupBy = (obj, category) => {
		const keys = Object.keys(obj);
		const mapping = keys.reduce((acc, k) => {
			obj[k].forEach(item => {
				Object.keys(item).forEach(yearKey => {
					var tracked = acc[yearKey];
					if (!tracked) {
						acc[yearKey] = {
							// year: yearKey
							[category]: yearKey
						};
					}
					acc[yearKey][k] = (acc[yearKey][k] | 0) + item[yearKey];
				});
			});
			return acc;
		}, {});
		return Object.values(mapping);
	};

	const data = React.useMemo(() => (clinicTest.entities ? groupBy(clinicTest.entities, category) : []), [
		clinicTest.entities,
		category
	]);

	const isEmpty = !!(data.length === 0);

	if (!companyInfo || companyInfo.length === 0) {
		return '';
	}

	if (!data) {
		return <SpinLoading />;
	}

	return (
		<Paper className="w-full h-full rounded-8 shadow py-8">
			<div className="px-12 flex items-center justify-between">
				<div className="flex flex-row items-center">
					<PopoverMsg title="임상실험" msg="선택하신 기업명으로 검색된 임상실험 내역들을 표시합니다." />
					<DraggableIcon />
				</div>
				{/* <MatrixAnalysisMenu /> */}
			</div>
			{isEmpty ? (
				<EmptyMsg
					icon="local_pharmacy"
					msg="임상실험"
					text="선택하신 기업명으로 검색된 임상실험 내역이 없습니다."
				/>
			) : (
				<>
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
											// dispatch(openEditContactDialog(row.original));
										}
									}}
								/>
							</FuseScrollbars>
						</>
					)}
				</>
			)}
		</Paper>
	);
}

export default ClinicTest;
