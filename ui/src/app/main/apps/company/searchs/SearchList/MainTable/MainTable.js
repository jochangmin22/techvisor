import React, { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithBlockLayout';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DownloadFilterMenu from '../DownloadFilterMenu';
// import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useDebounce } from '@fuse/hooks';
// import { parseInputSearchText } from 'app/main/apps/lib/parseParamsCompany';
import {
	updateCols,
	resetSelectedCode,
	setSelectedCode,
	// setSearchParams,
	setSearchSubmit
} from 'app/main/apps/company/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import clsx from 'clsx';

const columnName = {
	종목코드: '110',
	회사명: '180',
	업종: '200',
	주요제품: '400',
	대표자명: '150',
	// 지역: '100',
	시가총액: '100',
	'업종PER(%)': '100',
	'PER(배)': '100',
	'PER갭(%)': '100',
	'PBR(배)': '100',
	'EPS(원)': '100',
	'ROE(%)': '100',
	'ROA(%)': '100',
	// 부채비율: '100',
	현재가: '100',
	적정가: '100',
	'영업이익증감(전전)': 130,
	'순이익증감(전전)': 130,
	'영업이익증감(직전)': 130,
	'순이익증감(직전)': 130,
	현금배당수익률: 100
};

const csvHeaders = [
	{ key: '종목코드', label: '종목코드' },
	{ key: '회사명', label: '회사명' },
	{ key: '업종', label: '업종' },
	{ key: '주요제품', label: '주요제품' },
	{ key: '대표자명', label: '대표자명' },
	{ key: '시가총액', label: '시가총액' },
	{ key: '업종PER(%)', label: '업종PER(%)' },
	{ key: 'PER(배)', label: 'PER(배)' },
	{ key: 'PER갭(%)', label: 'PER갭(%)' },
	{ key: 'PBR(배)', label: 'PBR(배)' },
	{ key: 'EPS(원)', label: 'EPS(원)' },
	{ key: 'ROE(%)', label: 'ROE(%)' },
	{ key: 'ROA(%)', label: 'ROA(%)' },
	{ key: '현재가', label: '현재가' },
	{ key: '적정가', label: '적정가' },
	{ key: '영업이익증감(전전)', label: '영업이익증감(전전)' },
	{ key: '순이익증감(전전)', label: '순이익증감(전전)' },
	{ key: '영업이익증감(직전)', label: '영업이익증감(직전)' },
	{ key: '순이익증감(직전)', label: '순이익증감(직전)' },
	{ key: '부채비율', label: '부채비율' },
	{ key: '적(1)PER*EPS', label: '적정가(1)' },
	{ key: '적(2)ROE*EPS', label: '적정가(2)' },
	{ key: '적(3)EPS*10', label: '적정가(3)' },
	{ key: '적(4)s-lim', label: '적정가(4)' },
	{ key: '적(5)당기순이익*PER', label: '적정가(5)' }
];
// const columnName = {
// 	업체명: '180',
// 	사업자등록번호: '110',
// 	대표자: '150',
// 	주소: '100',
// 	상장일: '100',
// 	주식코드: '110',
// 	업종명: '200',
// 	주요제품: '700'
// };

const columns = Object.entries(columnName).map(([key, value]) => {
	const bold = key === '회사명' || key === '종목코드' ? 'text-16 font-500' : 'text-14 font-400';
	return {
		Header: key,
		accessor: key,
		className: clsx(bold, 'text-left truncate'),
		sortable: true,
		width: value
	};
});
const colsList = Object.keys(columnName).map((key, index) => ({
	id: key + 1,
	name: key,
	field: key
}));

function MainTable(props) {
	const dispatch = useDispatch();
	const entities = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const cols = useSelector(({ companyApp }) => companyApp.searchs.cols);
	const [csvData, setCsvData] = useState(entities);
	const data = useMemo(() => (entities ? entities : []), [entities]);
	useEffect(() => {
		setRowsCount(entities.length);
		setCsvData(
			entities.map(row => ({
				...row,
				종목코드: '=""' + row.종목코드 + '""'
			}))
		);
	}, [entities]);
	const [rowsCount, setRowsCount] = useState(null);

	const handleClick = (name, stockCode, corpNo) => {
		dispatch(resetSelectedCode());
		dispatch(setSelectedCode({ stockCode: stockCode, corpNo: corpNo }));
		dispatch(setSearchSubmit(true));
		props.onShrink(true);
	};

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 300);

	// function onBtExport() {}

	// if (!data || data.length === 0) {
	// 	return <SpinLoading />;
	// }

	return (
		<>
			<div className="p-12 flex items-center justify-between">
				<div className="flex flex-row items-center">
					<Typography variant="h6" className="pr-8">
						검색 결과 ({Number(rowsCount).toLocaleString()})
					</Typography>
					<DraggableIcon />
				</div>
				<div className="flex items-center">
					<Button
						variant="outlined"
						color="default"
						// onClick={onBtExport}
						className="shadow-none px-16"
						startIcon={<SaveAltIcon />}
					>
						<CSVLink data={csvData} headers={csvHeaders} filename={'company-list.csv'}>
							Export to CSV
						</CSVLink>
					</Button>
					<DownloadFilterMenu cols={cols} colsList={colsList} onChange={handleOnChange} />
				</div>
			</div>
			<FuseScrollbars className="max-h-512 px-6">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					onRowClick={(ev, row) => {
						if (row) {
							handleClick(row.original.회사명, row.original.종목코드);
						}
					}}
				/>
			</FuseScrollbars>
		</>
	);
}

export default withRouter(MainTable);
