import React, { useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableServerSide';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DownloadFilterMenu from '../DownloadFilterMenu';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useDebounce } from '@fuse/hooks';
import { updateCols } from 'app/main/apps/search/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

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

function MainTable(props) {
	const dispatch = useDispatch();
	const entities = useSelector(({ abroadApp }) => abroadApp.searchs.entities);

	const [data, setData] = useState(entities);
	const [loading, setLoading] = useState(false);
	const [pageCount, setPageCount] = useState(0);

	const cols = useSelector(({ abroadApp }) => abroadApp.searchs.cols);
	// const data = useMemo(() => (entities ? entities : []), [entities]);

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
				}
			}
			// eslint-disable-next-line
		},
		[entities]
	);

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 300);

	function onBtExport() {}

	if (!entities || entities.length === 0) {
		return <SpinLoading />;
	}

	return (
		<Paper className="rounded-8 shadow h-512 w-full mb-36">
			<>
				<div className="p-12 flex items-center justify-between">
					<div className="flex flex-row items-center">
						<Typography variant="h6" className="pr-8">
							검색 결과 ({Number(entities.length).toLocaleString()})
						</Typography>
						<DraggableIcon />
					</div>
					<div className="flex items-center">
						<Button
							variant="outlined"
							color="default"
							onClick={onBtExport}
							className="shadow-none px-16"
							startIcon={<SaveAltIcon />}
						>
							다운로드
						</Button>
						<DownloadFilterMenu cols={cols} colsList={colsList} onChange={handleOnChange} />
					</div>
				</div>
				<FuseScrollbars className="max-h-512 mx-8">
					<EnhancedTable
						columns={columns}
						data={data}
						fetchData={fetchData}
						loading={loading}
						pageCount={pageCount}
						size="small"
						onRowClick={(ev, row) => {
							if (row) {
								props.history.push(`/apps/search/${row.original.출원번호}`);
							}
						}}
					/>
				</FuseScrollbars>
			</>
		</Paper>
	);
}

export default withRouter(MainTable);
