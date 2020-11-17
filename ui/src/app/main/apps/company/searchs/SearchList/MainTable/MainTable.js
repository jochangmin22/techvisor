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
import ColumnMenu from '../ColumnMenu';
import { useDebounce } from '@fuse/hooks';
import { updateCols, resetSelectedCorp, setSelectedCorp } from 'app/main/apps/company/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { DefaultColumnFilter, NumberRangeColumnFilter } from 'app/main/apps/lib/EnhancedFilters';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import ReactGA from 'react-ga';

const useStyles = makeStyles(theme => ({
	dark: { backgroundColor: theme.palette.primary.dark },
	paper: { backgroundColor: theme.palette.background.paper },
	backdrop: { zIndex: theme.zIndex.drawer + 1 },
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
		}
	}
}));

function addZeroes(num) {
	return num === 0 || isNaN(num) ? 0 : Number(num).toFixed(2);
}

function MainTable() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const entities = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
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

	const columns = useMemo(
		() =>
			Object.entries(cols)
				.filter(([n, it]) => it.visible)
				.map(([n, it]) => {
					const bold = it.header === '회사명' ? 'text-16 font-500' : 'text-14 font-400';
					const textColumn = ['종목코드', '회사명', '업종', '주요제품', '대표자명'].includes(it.header);
					const align = textColumn ? 'text-left' : 'text-right';
					const stickyColumns = ['종목코드', '회사명'].includes(it.header) ? 'left' : '';
					return {
						Header: cols[n]['header'],
						accessor: cols[n]['accessor'],
						className: clsx(bold, align, 'truncate'),
						sortable: true,
						width: cols[n]['width'],
						sticky: stickyColumns,
						// defaultCanFilter: false,
						// disableFilters: disableFilters,
						Filter: textColumn ? DefaultColumnFilter : NumberRangeColumnFilter,
						filter: textColumn ? 'text' : 'between',
						Cell: ({ cell }) => {
							return (
								<div>
									<span
										className={clsx(
											cols[n]['colorize'] && cell.value < 0
												? 'text-blue'
												: cols[n]['colorize'] && cell.value > 0
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
				}),
		[cols]
	);

	const csvHeaders = cols
		.filter(item => item.visible)
		.map(item => {
			const obj = {
				key: item.accessor,
				label: item.header
			};
			return obj;
		});

	useEffect(() => {
		setRowsCount(entities.length);
		setCsvData(
			entities.map(row => ({
				...row,
				종목코드: '=""' + row.종목코드 + '""'
			}))
		);
	}, [entities]);

	// useUpdateEffect(() => {}, [searchLoading]);

	const [rowsCount, setRowsCount] = useState(null);

	const handleClick = (name, stockCode, corpNo) => {
		dispatch(resetSelectedCorp());
		dispatch(setSelectedCorp({ stockCode: stockCode, corpNo: corpNo, corpName: name }));
	};

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 100);

	// if (!!(searchText && !searchLoading && entities && entities.length === 0)) {
	if (!!(searchText && entities && entities.length === 0)) {
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
					<Typography className={clsx(classes.dark, 'text-13 font-400 rounded-4 text-white px-8 py-4 mr-8')}>
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
						<ReactGA.OutboundLink eventLabel="CompanyCsv" to="/" target="_ self">
							<CSVLink data={csvData} headers={csvHeaders} filename={'company-list.csv'}>
								Export to CSV
							</CSVLink>
						</ReactGA.OutboundLink>
					</Button>
					<ColumnMenu cols={cols} onChange={handleOnChange} />
				</div>
			</div>
			<FuseScrollbars className="max-h-460 mx-8">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					className={classes.table}
					pageSize={7}
					pageOptions={[7, 14, 21, 50]}
					onRowClick={(ev, row) => {
						if (row) {
							handleClick(row.original.회사명, row.original.종목코드);
						}
					}}
				/>
			</FuseScrollbars>
			{/* <SpinLoading
				className={clsx(showLoading ? 'visible' : 'hidden', classes.backdrop, 'absolute h-384 inset-0')}
			/> */}
		</div>
	);
}

export default withRouter(MainTable);
