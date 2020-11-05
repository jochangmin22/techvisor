import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableServerSide';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import DownloadFilterMenu from '../DownloadFilterMenu';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useDebounce } from '@fuse/hooks';
import { getOwnedPatent, updateCols } from 'app/main/apps/company/store/searchsSlice';
import { setTableOptions, setSelectedAppNo, openSearchPageDialog } from 'app/main/apps/search/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';

const columns = [
	{
		Header: '출원번호',
		accessor: '출원번호',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 140
	},
	{
		Header: '출원일',
		accessor: '출원일자',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 110
	},
	{
		Header: '상태',
		accessor: '등록사항',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 80
	},
	{
		Header: '발명의명칭(국문)',
		accessor: '발명의명칭(국문)',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 700
	},
	{
		Header: '출원인',
		accessor: '출원인1',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 250
	},
	{
		Header: '발명자',
		accessor: '발명자1',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 150
	},
	{
		Header: 'IPC',
		accessor: 'ipc요약',
		className: 'text-14 text-left truncate',
		sortable: true,
		width: 75
	}
];

const colsList = [
	{
		id: '1',
		name: '출원번호',
		field: '출원번호'
	},
	{
		id: '2',
		name: '출원일',
		field: '출원일자'
	},
	{
		id: '3',
		name: '상태',
		field: '등록사항'
	},
	{
		id: '4',
		name: '국문명칭',
		field: '발명의명칭(국문)'
	},
	{
		id: '5',
		name: '영문명칭',
		field: '발명의명칭(영문)'
	},
	{
		id: '6',
		name: '출원인',
		field: '출원인1'
	},
	{
		id: '7',
		name: '발명자',
		field: '발명자1'
	},
	{
		id: '8',
		name: 'IPC',
		field: 'ipc요약'
	}
	// {
	// 	id: '9',
	// 	name: '유사도',
	// 	field: '유사도'
	// }
];

const useStyles = makeStyles(theme => ({
	dark: { backgroundColor: theme.palette.primary.dark }
}));

function OwnedPatent(props) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const entities = useSelector(({ companyApp }) => companyApp.searchs.ownedPatent);
	const selectedCorp = useSelector(({ companyApp }) => companyApp.searchs.selectedCorp);
	const { corpName } = selectedCorp;

	const [data, setData] = useState(entities);
	const [csvData, setCsvData] = useState(entities);
	const [loading, setLoading] = useState(false);
	const [pageCount, setPageCount] = useState(0);

	const cols = useSelector(({ companyApp }) => companyApp.searchs.cols);

	const [showLoading, setShowLoading] = useState(false);
	// const data = useMemo(() => (entities ? entities : []), [entities]);

	useEffect(() => {
		setShowLoading(true);

		const params = {
			params: { corpName: corpName || '' },
			subParams: {}
		};

		dispatch(getOwnedPatent(params)).then(() => {
			setShowLoading(false);
		});
		// eslint-disable-next-line
	}, [corpName]);

	const fetchIdRef = useRef(0);

	const fetchData = useCallback(
		({ pageSize, pageIndex, sortBy }) => {
			const fetchId = ++fetchIdRef.current;

			setLoading(true);

			// Only update the data if this is the latest fetch
			if (entities && entities !== undefined) {
				if (fetchId === fetchIdRef.current) {
					const startRow = pageSize * pageIndex;
					const endRow = startRow + pageSize;
					if (sortBy.length === 0) {
						setData(entities.slice(startRow, endRow));
					} else {
						let sorted = entities.slice();
						sorted.sort((a, b) => {
							for (let i = 0; i < sortBy.length; ++i) {
								if (a[sortBy[i].id] > b[sortBy[i].id]) return sortBy[i].desc ? -1 : 1;
								if (a[sortBy[i].id] < b[sortBy[i].id]) return sortBy[i].desc ? 1 : -1;
							}
							return 0;
						});
						setData(sorted.slice(startRow, endRow));
					}

					// setPageCount(Math.ceil(entities.length / pageSize));
					setPageCount(entities.length);
					setLoading(false);
					// '=""' + customer.manufacturer_no + '""';
					setCsvData(
						entities.map(row => ({
							...row,
							출원번호: '=""' + row.출원번호 + '""',
							출원인코드1: '=""' + row.출원인코드1 + '""'
						}))
					);
					dispatch(
						setTableOptions({ totalPosts: entities.length, pageIndex: pageIndex, pageSize: pageSize })
					);
				}
			}
		},
		// eslint-disable-next-line
		[entities]
	);

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 300);

	const isEmpty = !!(entities.length === 0 && !showLoading);
	const emptyText =
		corpName !== undefined && corpName
			? '선택하신 기업명으로 검색된 보유특허 내역이 없습니다.'
			: '먼저 기업명을 선택해주세요';

	return (
		<div className="w-full h-full pb-8">
			<div className="p-12 flex items-center justify-between">
				<div className="px-12 flex items-center justify-end mb-8">
					<Typography className={clsx(classes.dark, 'text-13 font-400 rounded-4 text-white px-8 py-4')}>
						검색 결과 {Number(entities.length).toLocaleString()} 건
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
						<CSVLink data={csvData} filename={'patent-list.csv'}>
							Export to CSV
						</CSVLink>
					</Button>
					<DownloadFilterMenu cols={cols} colsList={colsList} onChange={handleOnChange} />
				</div>
			</div>
			{isEmpty ? (
				<EmptyMsg icon="wb_incandescent" msg="특허" text={emptyText} className="h-320" />
			) : (
				<FuseScrollbars className="max-h-320 mx-8">
					{showLoading ? (
						<SpinLoading className="h-320" />
					) : (
						<EnhancedTable
							columns={columns}
							data={data}
							fetchData={fetchData}
							loading={loading}
							pageCount={pageCount}
							pageSize={6}
							pageOptions={[6, 12, 18]}
							size="small"
							onRowClick={(ev, row) => {
								if (row) {
									dispatch(setSelectedAppNo(row.original.출원번호));
									dispatch(openSearchPageDialog());
									// props.history.push(`/apps/search/${row.original.출원번호}`);
								}
							}}
						/>
					)}
				</FuseScrollbars>
			)}
		</div>
	);
}

export default withRouter(OwnedPatent);
