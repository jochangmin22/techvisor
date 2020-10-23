import React, { useState, useEffect, useMemo } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { getClinicTest } from 'app/main/apps/company/store/searchsSlice';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
// import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
// import MatrixAnalysisMenu from '../MatrixAnalysisMenu';

const useStyles = makeStyles(theme => ({
	root: { backgroundColor: theme.palette.primary.dark }
}));

const columnName = {
	신청자: '180',
	임상단계: '110',
	승인일: '110',
	제품명: '180',
	시험제목: '100',
	연구실명: '100'
};

const columns = Object.entries(columnName).map(([key, value]) => {
	const bold = key === '신청자' || key === '임상단계' ? 'text-14 font-500' : 'text-12 font-400';
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

function ClinicTest() {
	const dispatch = useDispatch();
	const classes = useStyles();
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
		let params = { corpName: '' };
		if (corpName !== undefined && corpName) {
			params = { corpName: corpName };
		}
		dispatch(getClinicTest(params)).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [corpName]);

	const isEmpty = !!(data.length === 0 && !showLoading);

	// if (corpName === undefined) {
	// 	return '';
	// }

	return (
		<div className="w-full h-full py-8">
			<div className="px-12 flex items-center justify-end mb-8">
				<Typography className={clsx(classes.root, 'text-13 font-400 rounded-4 text-white px-8 py-4')}>
					검색 결과 {Number(rowsCount).toLocaleString()} 건
				</Typography>
			</div>
			{isEmpty ? (
				<EmptyMsg
					icon="local_pharmacy"
					msg="임상실험"
					text="선택하신 기업명으로 검색된 임상실험 내역이 없습니다."
					className="h-360"
				/>
			) : (
				<FuseScrollbars className="max-h-360 px-6">
					{showLoading ? (
						<SpinLoading className="h-360" />
					) : (
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
					)}
				</FuseScrollbars>
			)}
		</div>
	);
}

export default ClinicTest;
