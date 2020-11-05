import React, { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithBlockLayout';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import DownloadFilterMenu from '../DownloadFilterMenu';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useDebounce } from '@fuse/hooks';
import { getAssociateCorp } from 'app/main/apps/search/store/searchSlice';
import { updateCols, resetSelectedCorp, setSelectedCorp } from 'app/main/apps/company/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

// TO-DO: KSIC 산업코드 - IPC로 검색 ; 현재, 출원인명 <-> 대표자, 기업명으로 검색됨

const columnName = {
	종목코드: '110',
	회사명: '180',
	업종: '200',
	주요제품: '400',
	대표자명: '150',
	시가총액: '100',
	'업종PER(배)': '100',
	'PER(배)': '100',
	'PER갭(%)': '100',
	'PRR(배)': '100',
	'PGF(%)': '100',
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
	{ key: '업종PER(배)', label: '업종PER(배)' },
	{ key: 'PER(배)', label: 'PER(배)' },
	{ key: 'PER갭(%)', label: 'PER갭(%)' },
	{ key: 'PRR(배)', label: 'PRR(배)' },
	{ key: 'PGF(%)', label: 'PGF(%)' },
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

const columns = Object.entries(columnName).map(([key, value]) => {
	const bold = key === '회사명' ? 'text-16 font-500' : 'text-14 font-400';
	const align =
		key === '종목코드' || key === '회사명' || key === '업종' || key === '주요제품' || key === '대표자명'
			? 'text-left'
			: 'text-right';
	return {
		Header: key,
		accessor: key,
		className: clsx(bold, align, 'truncate'),
		sortable: true,
		width: value
	};
});
const colsList = Object.keys(columnName).map((key, index) => ({
	id: key + 1,
	name: key,
	field: key
}));

const useStyles = makeStyles(theme => ({
	paper: { backgroundColor: theme.palette.background.paper },
	label: { backgroundColor: theme.palette.primary.dark }
}));

function addZeroes(num) {
	return num === 0 || isNaN(num) ? 0 : Number(num).toFixed(2);
}

function AssociateCompany(props) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const { applicant } = props;
	const entities = useSelector(({ searchApp }) => searchApp.search.associateCorp);
	const cols = useSelector(({ searchApp }) => searchApp.search.cols);
	const [csvData, setCsvData] = useState(entities);

	const [showLoading, setShowLoading] = useState(false);

	useEffect(() => {
		if (applicant) {
			setShowLoading(true);
			dispatch(getAssociateCorp({ applicant: applicant })).then(() => {
				setShowLoading(false);
			});
		}
		// eslint-disable-next-line
	}, [applicant]);

	const data = useMemo(
		() =>
			entities
				? entities.map(row => ({
						...row,
						'업종PER(배)': addZeroes(row['업종PER(배)']),
						'PER(배)': addZeroes(row['PER(배)']),
						'PER갭(%)': addZeroes(row['PER갭(%)']),
						'PRR(배)': addZeroes(row['PRR(배)']),
						'PBR(배)': addZeroes(row['PBR(배)']),
						'ROA(%)': addZeroes(row['ROA(%)']),
						'영업이익증감(전전)': addZeroes(row['영업이익증감(전전)']),
						'순이익증감(전전)': addZeroes(row['순이익증감(전전)']),
						'영업이익증감(직전)': addZeroes(row['영업이익증감(직전)']),
						'순이익증감(직전)': addZeroes(row['순이익증감(직전)']),
						현금배당수익률: addZeroes(row['현금배당수익률'])
				  }))
				: [],
		[entities]
	);
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
		dispatch(resetSelectedCorp());
		dispatch(setSelectedCorp({ stockCode: stockCode, corpNo: corpNo, corpName: name }));
	};

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 300);

	const isEmpty = !!(entities.length === 0 && !showLoading);

	return (
		<div className={clsx(classes.paper, 'w-full h-auto shadow rounded-8 py-8')}>
			<div className="flex items-center justify-between">
				<div className="px-12 flex flex-row items-center justify-end mb-8">
					<Typography className={clsx(classes.label, 'text-13 font-400 rounded-4 text-white px-8 py-4 mr-8')}>
						기업 매칭 결과 {Number(rowsCount).toLocaleString()} 건
					</Typography>
					<Typography className="text-right text-12 items-center">
						{/* ** 본 기술과의 출원인업종 분류 키워드가 일치하는 기업정보를 표시합니다. */}
						** 본 기술과의 출원인 키워드가 일치하는 기업정보를 표시합니다.
					</Typography>
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
			{isEmpty ? (
				<EmptyMsg
					icon="domain"
					msg="검색된 기업이 없습니다."
					text="출원인 키워드와 일치하는 기업이 발견되지 않았습니다."
					className="h-360"
				/>
			) : (
				<FuseScrollbars className="max-h-360 mx-8">
					{showLoading ? (
						<SpinLoading className="h-360" />
					) : (
						<EnhancedTable
							columns={columns}
							data={data}
							size="small"
							pageSize={8}
							pageOptions={[8, 25, 50]}
							onRowClick={(ev, row) => {
								if (row) {
									handleClick(row.original.회사명, row.original.종목코드);
								}
							}}
						/>
					)}
				</FuseScrollbars>
			)}
		</div>
	);
}

export default AssociateCompany;
