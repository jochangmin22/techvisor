import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSVLink } from 'react-csv';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableServerSide';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import ColumnMenu from '../ColumnMenu';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import { useDebounce } from '@fuse/hooks';
import {
	updateCols,
	setTableOptions,
	setSelectedAppNo,
	openSearchPageDialog
} from 'app/main/apps/search/store/searchsSlice';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import ReactGA from 'react-ga';

const useStyles = makeStyles(theme => ({
	dark: { backgroundColor: theme.palette.primary.dark },
	paper: { backgroundColor: theme.palette.background.paper },
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

function MainTable(props) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const entities = useSelector(({ searchApp }) => searchApp.searchs.entities);
	const cols = useSelector(({ searchApp }) => searchApp.searchs.cols);
	const [data, setData] = useState(entities);
	const [csvData, setCsvData] = useState(entities);
	const [loading, setLoading] = useState(false);
	const [pageCount, setPageCount] = useState(0);

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

	const columns = useMemo(
		() =>
			Object.entries(cols)
				.filter(([n, it]) => it.visible)
				.map(([n, it]) => {
					return {
						Header: cols[n]['header'],
						accessor: cols[n]['accessor'],
						className: 'text-left text-14 font-400 truncate',
						sortable: true,
						width: cols[n]['width'],
						Cell: ({ cell }) => {
							return (
								<div>
									<span title={cell.value}>{cell.value}</span>
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

	const handleOnChange = useDebounce(cols => {
		dispatch(updateCols(cols));
	}, 100);

	// function onBtExport() {}

	return (
		<div className={clsx(classes.paper, 'rounded-8 shadow h-512 w-full mb-36')}>
			<div className="p-12 p-0 flex items-center justify-between">
				<div className="px-12 flex flex-row items-center justify-end mb-8">
					<Typography className={clsx(classes.dark, 'text-13 font-400 rounded-4 text-white px-8 py-4 mr-8')}>
						검색 결과 {Number(entities.length).toLocaleString()} 건
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
						<ReactGA.OutboundLink eventLabel="PatentCsv" to="/" target="_ self">
							<CSVLink data={csvData} headers={csvHeaders} filename={'patent-list.csv'}>
								Export to CSV
							</CSVLink>
						</ReactGA.OutboundLink>
					</Button>
					<ColumnMenu cols={cols} onChange={handleOnChange} />
				</div>
			</div>
			<FuseScrollbars className="max-h-460 mx-8">
				{!entities || entities.length === 0 ? (
					<SpinLoading className="h-460" />
				) : (
					<EnhancedTable
						columns={columns}
						data={data}
						fetchData={fetchData}
						loading={loading}
						pageCount={pageCount}
						size="small"
						onRowClick={(ev, row) => {
							if (row) {
								dispatch(setSelectedAppNo(row.original.출원번호));
								dispatch(openSearchPageDialog());
								// props.history.push(`/apps/searchPage/${row.original.출원번호}`);
							}
						}}
					/>
				)}
			</FuseScrollbars>
		</div>
	);
}

export default withRouter(MainTable);
