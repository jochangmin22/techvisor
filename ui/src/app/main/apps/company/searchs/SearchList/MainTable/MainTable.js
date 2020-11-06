import React, { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithFilter';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import DownloadFilterMenu from '../DownloadFilterMenu';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useDebounce } from '@fuse/hooks';
import { updateCols, resetSelectedCorp, setSelectedCorp } from 'app/main/apps/company/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { DefaultColumnFilter, NumberRangeColumnFilter } from 'app/main/apps/lib/EnhancedFilters';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import { showMessage } from 'app/store/fuse/messageSlice';

const useStyles = makeStyles(theme => ({
	root: { backgroundColor: theme.palette.primary.dark },
	paper: { backgroundColor: theme.palette.background.paper },
	textColor: { color: theme.palette.secondary.main },
	backdrop: {
		zIndex: theme.zIndex.drawer + 1
	},
	table: {
		'&.sticky': {
			overflow: 'scroll',
			'& thead, & .tfooter': {
				position: 'sticky',
				zIndex: 1,
				width: 'fit-content'
			},
			'& tbody': {
				position: 'relative',
				zIndex: 0
			},
			'& [data-sticky-td]': {
				position: 'sticky',
				backgroundColor: theme.palette.background.default,
				'&:hover': {
					backgroundColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,.04)'
				}
			}
			// '& [data-sticky-last-left-td]': {
			// 	boxShadow: '1px 0px 0px #ccc'
			// }
		}
	}
}));

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
	부채비율: 130,
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
	{ key: '현금배당수익률', label: '현금배당수익률' },
	{ key: '적(1)PER*EPS', label: '적정가(1)' },
	{ key: '적(2)ROE*EPS', label: '적정가(2)' },
	{ key: '적(3)EPS*10', label: '적정가(3)' },
	{ key: '적(4)s-lim', label: '적정가(4)' },
	{ key: '적(5)당기순이익*PER', label: '적정가(5)' }
];

const colorizeColumns = [
	'PGF(%)',
	'EPS(원)',
	'ROE(%)',
	'ROA(%)',
	'영업이익증감(전전)',
	'순이익증감(전전)',
	'영업이익증감(직전)',
	'순이익증감(직전)'
];

const columns = Object.entries(columnName).map(([key, value]) => {
	const bold = key === '회사명' ? 'text-16 font-500' : 'text-14 font-400';
	const align =
		key === '종목코드' || key === '회사명' || key === '업종' || key === '주요제품' || key === '대표자명'
			? 'text-left'
			: 'text-right';
	const textFilters = ['종목코드', '회사명', '업종', '주요제품', '대표자명'].includes(key);
	const stickyColumns = key === '회사명' || key === '종목코드' ? true : false;
	return {
		Header: key,
		accessor: key,
		className: clsx(bold, align, 'truncate'),
		sortable: true,
		width: value,
		sticky: clsx(stickyColumns ? 'left' : ''),
		// defaultCanFilter: false,
		// disableFilters: disableFilters,
		Filter: textFilters ? DefaultColumnFilter : NumberRangeColumnFilter,
		filter: textFilters ? 'text' : 'between',
		Cell: ({ cell }) => {
			return (
				<div>
					<span
						className={clsx(
							colorizeColumns.includes(cell.column.id) && cell.value < 0
								? 'text-blue'
								: colorizeColumns.includes(cell.column.id) && cell.value > 0
								? 'text-red'
								: ''
						)}
						title={cell.value}
					>
						{cell.value}
					</span>
				</div>
			);
		}
	};
});

const colsList = Object.keys(columnName).map((key, index) => ({
	id: key + 1,
	name: key,
	field: key
}));

function addZeroes(num) {
	return num === 0 || isNaN(num) ? 0 : Number(num).toFixed(2);
}

function MainTable() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const entities = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);
	const cols = useSelector(({ companyApp }) => companyApp.searchs.cols);

	const [csvData, setCsvData] = useState(entities);
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

	useEffect(() => {}, [searchLoading]);

	const [rowsCount, setRowsCount] = useState(null);

	const handleClick = (name, stockCode, corpNo) => {
		if (stockCode === null) {
			dispatch(
				showMessage({
					message: '현재 코스피 상장 종목만 지원합니다.',
					autoHideDuration: 2000,
					anchorOrigin: {
						vertical: 'top',
						horizontal: 'right'
					},
					variant: 'info' //success error info warning null
				})
			);
		} else {
			dispatch(
				showMessage({
					message: `${name} 을 불러오는 중입니다.`,
					autoHideDuration: 2000,
					anchorOrigin: {
						vertical: 'top',
						horizontal: 'right'
					},
					variant: 'success' //success error info warning null
				})
			);
			dispatch(resetSelectedCorp());
			dispatch(setSelectedCorp({ stockCode: stockCode, corpNo: corpNo, corpName: name }));
		}
	};

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 300);

	if (!!(searchText && !searchLoading && entities && entities.length === 0)) {
		return (
			<div className={clsx(classes.paper, 'rounded-8 shadow h-full w-full')}>
				<NoResultMsg className="h-384" />
			</div>
		);
	}

	return (
		<div className={clsx(classes.paper, 'rounded-8 shadow h-full w-full')}>
			<div className="p-12 pb-0 flex items-center justify-between">
				<div className="px-12 flex flex-row items-center justify-end mb-8">
					<Typography className={clsx(classes.root, 'text-13 font-400 rounded-4 text-white px-8 py-4 mr-8')}>
						검색 결과 {Number(rowsCount).toLocaleString()} 건
					</Typography>
					<DraggableIcon />
				</div>
				<div className="flex items-center">
					<Button
						variant="outlined"
						color="default"
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
			<FuseScrollbars className="max-h-460 mx-8">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					className={classes.table}
					pageSize={7}
					pageOptions={[14, 21, 50]}
					onRowClick={(ev, row) => {
						if (row) {
							handleClick(row.original.회사명, row.original.종목코드);
						}
					}}
				/>
			</FuseScrollbars>
			<SpinLoading
				className={clsx(searchLoading ? 'visible' : 'hidden', classes.backdrop, 'absolute h-384 inset-0')}
			/>
		</div>
	);
}

export default withRouter(MainTable);
