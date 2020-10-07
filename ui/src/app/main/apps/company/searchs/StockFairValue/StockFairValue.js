import React, { useState, useEffect, useMemo } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Typography from '@material-ui/core/Typography';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { getClinicTest } from 'app/main/apps/company/store/searchsSlice';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import Paper from '@material-ui/core/Paper';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
// import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
// import MatrixAnalysisMenu from '../MatrixAnalysisMenu';

const columnName = {
	신청자: '180',
	임상단계: '110',
	승인일: '110',
	제품명: '180',
	시험제목: '100',
	연구실명: '100'
};

const columns = Object.entries(columnName).map(([key, value]) => {
	const bold = key === '신청자' || key === '임상단계' ? 'text-16 font-500' : 'text-13 font-400';
	return {
		Header: key,
		accessor: key,
		className: clsx(bold, 'text-left truncate'),
		sortable: true,
		width: value
	};
});

// const colsList = Object.keys(columnName).map((key, index) => ({
// 	id: key + 1,
// 	name: key,
// 	field: key
// }));

function StockFairValue() {
	const dispatch = useDispatch();
	const clinicTest = useSelector(({ companyApp }) => companyApp.searchs.clinicTest);
	// const clinicOptions = useSelector(({ companyApp }) => companyApp.searchs.clinicOptions);
	const companyInfo = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);
	const { 회사명: corpName } = companyInfo;

	const data = useMemo(() => (clinicTest ? clinicTest : []), [clinicTest]);

	useEffect(() => {
		setRowsCount(data.length);
	}, [data]);
	const [rowsCount, setRowsCount] = useState(null);

	const [showLoading, setShowLoading] = useState(false);

	useEffect(() => {
		setShowLoading(true);
		if (corpName !== undefined && corpName) {
			dispatch(getClinicTest({ corpName: corpName })).then(() => {
				setShowLoading(false);
			});
		}
		// eslint-disable-next-line
	}, [corpName]);

	const isEmpty = !!(data.length === 0);

	// if (corpName === undefined) {
	// 	return '';
	// }

	return (
		<Paper className="w-full h-full rounded-8 shadow py-8">
			<div className="px-12 flex items-center justify-between">
				<div className="flex flex-row items-center">
					<PopoverMsg title="적정주가분석" msg="검색한 목록의 적정주가를 분석합니다." />
					<DraggableIcon />
					<Typography variant="h6" className="pl-16">
						검색 결과 ({Number(rowsCount).toLocaleString()})
					</Typography>
				</div>
			</div>
			{isEmpty ? (
				<EmptyMsg icon="equalizer" msg="적정주가분석" text="검색한 목록의 적정주가 내역이 없습니다." />
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

export default StockFairValue;
