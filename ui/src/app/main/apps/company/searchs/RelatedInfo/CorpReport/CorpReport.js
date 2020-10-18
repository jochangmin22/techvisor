import React, { useState, useEffect, useMemo } from 'react';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { getDisclosureReport } from 'app/main/apps/company/store/searchsSlice';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
// import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
// import MatrixAnalysisMenu from '../MatrixAnalysisMenu';

const useStyles = makeStyles(theme => ({
	root: { backgroundColor: theme.palette.primary.dark }
}));

const columnName = {
	공시대상회사: '180',
	보고서명: '300',
	제출인: '110',
	접수일자: '180',
	비고: '100'
};

const columns = Object.entries(columnName).map(([key, value]) => {
	const bold = key === '공시대상회사' || key === '보고서명' ? 'text-14 font-500' : 'text-12 font-400';
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

function CorpReport() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const disclosureReport = useSelector(({ companyApp }) => companyApp.searchs.disclosureReport);
	// const clinicOptions = useSelector(({ companyApp }) => companyApp.searchs.clinicOptions);
	const companyInfo = useSelector(({ companyApp }) => companyApp.searchs.companyInfo);
	const { 회사명: corpName } = companyInfo;

	const data = useMemo(() => (disclosureReport ? disclosureReport : []), [disclosureReport]);

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
		dispatch(getDisclosureReport(params)).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [corpName]);

	const isEmpty = !!(data.length === 0);

	// if (corpName === undefined) {
	// 	return '';
	// }

	return (
		<div className="w-full h-full py-8">
			<div className="px-12 flex items-center justify-end mb-8">
				<Typography className={clsx(classes.root, 'text-11 font-500 rounded-4 text-white px-8 py-4')}>
					검색 결과 {Number(rowsCount).toLocaleString()} 건
				</Typography>
			</div>
			{isEmpty ? (
				<div className="max-h-320">
					<EmptyMsg
						icon="camera"
						msg="전자공시"
						text="선택하신 기업명으로 검색된 전자공시 내역이 없습니다."
					/>
				</div>
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
											window.open(
												'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=' + row.original.접수번호,
												'_blank'
											);
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
		</div>
	);
}

export default CorpReport;
