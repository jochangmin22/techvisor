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
	회사명: '180',
	종목코드: '110',
	업종: '200',
	주요제품: '700',
	상장일: '120',
	대표자명: '200',
	지역: '100'
};
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
	const bold = '회사명' || key === '종목코드' ? 'text-16 font-500' : 'text-13 font-400';
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
	const searchs = useSelector(({ companyApp }) => companyApp.searchs);
	const { entities, cols } = searchs;
	const data = useMemo(() => (entities ? entities : []), [entities]);
	useEffect(() => {
		setRowsCount(data.length);
	}, [data]);
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
						<CSVLink data={data} filename={'company-list.csv'}>
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
