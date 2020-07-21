// eslint-disable
import React, { useMemo, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import MaUTable from '@material-ui/core/Table';
import {
	Icon,
	IconButton,
	Input,
	Select,
	MenuItem,
	TextField,
	TableContainer,
	TableHead,
	TableBody,
	TableCell,
	TableRow,
	TablePagination
} from '@material-ui/core';
import {
	useTable,
	useFilters,
	useGlobalFilter,
	useSortBy,
	useGroupBy,
	useExpanded,
	useRowSelect,
	usePagination,
	useBlockLayout
} from 'react-table';

import _ from '@lodash';
// import clsx from "clsx";
// import { FixedSizeList } from "react-window";
// import ClassifyHeaderTableHead from "./ClassifyHeaderTableHead";

import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import { selectMainTheme } from 'app/store/fuse/settingsSlice';
// import RawDataInfo from "./widgets/RawDataInfo";
import RawDataRatio from './RawDataRatio';
import {
	GlobalFilter,
	DefaultColumnFilter,
	SelectColumnFilter,
	SliderColumnFilter,
	NumberRangeColumnFilter,
	fuzzyTextFilterFn
} from './HeaderTableFilter';

import { IndeterminateCheckbox } from './HeaderTableSelection';
import HeaderTableToolbar from './HeaderTableToolbar';

const themeTable = createMuiTheme({
	overrides: {
		MuiTableCell: {
			root: {
				fontSize: '1.1rem',
				background: 'steelblue'
			},
			body: {
				color: 'white'
			},
			head: {
				color: 'white',
				minHeight: '3rem',
				height: '3rem'
			}
		},
		MuiTableRow: {
			root: {
				minWidth: '800px'
			}
		},
		MuiTablePagination: {
			root: {
				color: 'white',
				background: 'steelblue'
			},
			toolbar: {
				minHeight: '3rem',
				height: '3rem'
			}
		},
		MuiIconButton: {
			root: {
				padding: 2
			}
		},
		MuiIcon: {
			root: {
				fontSize: '2rem'
			}
		},
		MuiSvgIcon: {
			root: {
				fontSize: '2rem'
			}
		}
	}
});

const useStyles = makeStyles(theme => ({
	visuallyHidden: {
		border: 0,
		clip: 'rect(0 0 0 0)',
		height: 1,
		margin: -1,
		overflow: 'hidden',
		padding: 0,
		position: 'absolute',
		top: 20,
		width: 1
	}
}));
// const useStyles = makeStyles(theme => ({
//     root: {
//         width: "100%",
//         marginTop: theme.spacing(3)
//     },
//     paper: {
//         width: "100%",
//         marginBottom: theme.spacing(2)
//         // background: theme.palette.background.paper
//     },
//     table: {
//         minwidth: 750
//     },
//     tableWrapper: {
//         overflowX: "auto"
//     },
//     tableCell: {
//         fontSize: "1.1rem",
//         background: "steelblue"
//     },
//     tablePaginationToolbar: {
//         fontSize: "1.1rem",
//         background: "steelblue",
//         minHeight: 20
//     },
//     visuallyHidden: {
//         border: 0,
//         clip: "rect(0 0 0 0)",
//         height: 1,
//         margin: -1,
//         overflow: "hidden",
//         padding: 0,
//         position: "absolute",
//         top: 20,
//         width: 1
//     }
// }));

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val;

function Table({ columns, data }) {
	const classes = useStyles();
	// const mainTheme = useSelector(selectMainTheme);
	const filterTypes = React.useMemo(
		() => ({
			// Add a new fuzzyTextFilterFn filter type.
			fuzzyText: fuzzyTextFilterFn,
			// Or, override the default text filter to use
			// "startWith"
			text: (rows, id, filterValue) => {
				return rows.filter(row => {
					const rowValue = row.values[id];
					return rowValue !== undefined
						? String(rowValue)
								.toLowerCase()
								.startsWith(String(filterValue).toLowerCase())
						: true;
				});
			}
		}),
		[]
	);

	const defaultColumn = React.useMemo(
		() => ({
			// Let's set up our default Filter UI
			Filter: DefaultColumnFilter
		}),
		[]
	);

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		page,

		state,
		flatColumns,
		preGlobalFilteredRows,
		setGlobalFilter,
		selectedFlatRows,
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		state: { pageIndex, pageSize, selectedRowIds }
	} = useTable(
		{
			columns,
			data,
			defaultColumn,
			filterTypes,
			useSortBy,
			useGroupBy,
			useExpanded,
			initialState: { pageSize: 3 }
		},
		useFilters,
		useGlobalFilter,
		useBlockLayout,
		usePagination,
		useRowSelect,
		hooks => {
			hooks.flatColumns.push(columns => [
				// Let's make a column for selection
				{
					id: 'selection',
					// The header can use the table's getToggleAllRowsSelectedProps method
					// to render a checkbox
					Header: ({ getToggleAllRowsSelectedProps }) => (
						<IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
					),
					// The cell can use the individual row's getToggleRowSelectedProps method
					// to the render a checkbox
					Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
					width: 30
				},
				...columns
			]);
		}
	);

	// const firstPageRows = rows.slice(0, 3);

	// const [order, setOrder] = useState("asc");
	// const [orderBy, setOrderBy] = useState("출원번호");
	// const [selected, setSelected] = useState([]);
	// const [page, setPage] = useState(0);
	// const [dense, setDense] = useState(true);
	// const [rowsPerPage, setRowsPerPage] = useState(3);

	// const handleRequestSort = (event, property) => {
	//     const isDesc = orderBy === property && order === "desc";
	//     setOrder(isDesc ? "asc" : "desc");
	//     setOrderBy(property);
	// };

	// const handleSelectAllClick = event => {
	//     if (event.target.checked) {
	//         const newSelecteds = rows.map(n => n.출원번호);
	//         setSelected(newSelecteds);
	//         return;
	//     }
	//     setSelected([]);
	// };

	// const handleClick = (event, name) => {
	//     const selectedIndex = selected.indexOf(name);
	//     let newSelected = [];

	//     if (selectedIndex === -1) {
	//         newSelected = newSelected.concat(selected, name);
	//     } else if (selectedIndex === 0) {
	//         newSelected = newSelected.condat(selected.slice(1));
	//     } else if (selectedIndex > 0) {
	//         newSelected = newSelected.concat(
	//             selected.slice(0, selectedIndex),
	//             selected.slice(selectedIndex + 1)
	//         );
	//     }
	//     setSelected(newSelected);
	// };

	// const handleChangePage = (event, newPage) => {
	//     setPage(newPage);
	// };

	// const handleChangeRowsPerPage = event => {
	//     setRowsPerPage(parseInt(event.target.value, 10));
	//     setPage(0);
	// };

	// const handleChangeDense = event => {
	//     setDense(event.target.checked);
	// };

	// const isSelected = name => selected.indexOf(name) !== -1;

	// const emptyRows =
	//     rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

	// const RenderRow = useCallback(
	//     ({ index, style }) => {
	//         const row = rows[index];
	//         prepareRow(row);
	//         return (
	//             <TableRow {...row.getRowProps({ style })}>
	//                 {row.cells.map(cell => {
	//                     return (
	//                         <TableCell {...cell.getCellProps()}>
	//                             {cell.render("Cell")}
	//                         </TableCell>
	//                     );
	//                 })}
	//             </TableRow>
	//         );
	//     },
	//     [prepareRow, rows]
	// );
	// const firstPageRows = rows.slice(0, 3);

	// Render the UI for your table
	return (
		<ThemeProvider theme={themeTable}>
			<HeaderTableToolbar numSelected={Object.keys(selectedRowIds).length} />
			<MaUTable {...getTableProps()} size="small">
				<TableHead>
					{headerGroups.map(headerGroup => (
						<TableRow {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map(column => (
								<TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
							))}
						</TableRow>
					))}
				</TableHead>
				<TableBody {...getTableBodyProps()}>
					{page.map((row, i) => {
						prepareRow(row);
						return (
							<TableRow className="cursor-pointer" hover {...row.getRowProps()}>
								{row.cells.map(cell => {
									return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
								})}
							</TableRow>
						);
					})}
				</TableBody>
			</MaUTable>

			<div className="bg-blue-700 text-12 h-32">
				<IconButton aria-label="Previous Page" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
					<Icon>first_page</Icon>
				</IconButton>
				<IconButton aria-label="Previous Page" onClick={() => previousPage()} disabled={!canPreviousPage}>
					<Icon>navigate_before</Icon>
				</IconButton>
				<IconButton aria-label="Previous Page" onClick={() => nextPage()} disabled={!canNextPage}>
					<Icon>navigate_next</Icon>
				</IconButton>{' '}
				<IconButton aria-label="Previous Page" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
					<Icon>last_page</Icon>
				</IconButton>{' '}
				<span>
					Page{' '}
					<strong>
						{pageIndex + 1} of {pageOptions.length}
					</strong>{' '}
				</span>
				<span>
					| Go to page:{' '}
					<TextField
						// type="number"
						defaultValue={pageIndex + 1}
						onChange={e => {
							const page = e.target.value ? Number(e.target.value) - 1 : 0;
							gotoPage(page);
						}}
						InputLabelProps={{
							shrink: true
						}}
						className="text-13 text-white"
					/>
					{/* <Input
                        type="number"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value
                                ? Number(e.target.value) - 1
                                : 0;
                            gotoPage(page);
                        }}
                        style={{ width: "100px" }}
                    /> */}
				</span>{' '}
				<Select
					value={pageSize}
					onChange={e => {
						setPageSize(Number(e.target.value));
					}}
					displayEmpty
					className="text-13 text-white"
				>
					{[3, 10, 20, 30, 40, 50].map(pageSize => (
						<MenuItem value={pageSize}>{pageSize}</MenuItem>
					))}
				</Select>
			</div>
			{/* <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pageCount}
                rowsPerPage={pageSize}
                page={pageIndex}
                backIconButtonProps={{
                    "aria-label": "Previous Page"
                }}
                nextIconButtonProps={{
                    "aria-label": "Next Page"
                }}
                onChangePage={e => {
                    const page = e.target.value
                        ? Number(e.target.value) - 1
                        : 0;
                    gotoPage(page);
                }}
                onChangeRowsPerPage={e => {
                    setPageSize(Number(e.target.value));
                }}
            /> */}
			{/* <pre>
                <code>
                    {JSON.stringify(
                        {
                            pageIndex,
                            pageSize,
                            pageCount,
                            canNextPage,
                            canPreviousPage
                        },
                        null,
                        2
                    )}
                </code>
            </pre> */}
			{/* <TablePagination
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                backIconButtonProps={{
                    "aria-label": "Previous Page"
                }}
                nextIconButtonProps={{
                    "aria-label": "Next Page"
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            /> */}
			{/* </TableContainer> */}
		</ThemeProvider>
	);
}

function HeaderTable(props) {
	// const dispatch = useDispatch();
	// const [filteredData, setFilteredData] = useState();
	const mainTheme = useSelector(selectMainTheme);
	const columns = useMemo(
		() => [
			{
				Header: '등록사항',
				id: '등록사항',
				accessor: '등록사항',
				width: 90
			},
			{
				Header: 'IPC',
				id: 'ipc요약',
				accessor: 'ipc요약',
				width: 50
			},
			{
				Header: '발명의명칭(국문)',
				id: '발명의명칭(국문)',
				accessor: '발명의명칭(국문)',
				width: 450
			},
			{
				Header: '출원번호',
				id: '출원번호',
				accessor: '출원번호',
				width: 100
			},
			{
				Header: '출원일',
				id: '출원일자',
				accessor: '출원일자',
				width: 80
			}
		],
		[]
	);

	const data = useMemo(() => props.data, []);

	return (
		<ThemeProvider theme={mainTheme}>
			<RawDataRatio data={props.data} />
			{/* <div className="table-responsive"> */}
			<Table
				data={data}
				columns={columns}
				// getHeaderProps={columns => ({
				//     style: {
				//       width: `${120 * ((120 - columns.value = ) / 120) * -1 +
				//         120}, 100%, 67%)`,
				//     },
				//   })}
				// initialState: { pageSize: 4 }
				// defaultPageSize={5}
				// className="-striped -highlight"
			/>
			{/* <RawDataInfo data={props.data} /> */}
			{/* </div> */}
		</ThemeProvider>
	);
}

export default HeaderTable;
