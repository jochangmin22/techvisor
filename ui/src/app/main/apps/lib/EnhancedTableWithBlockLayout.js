import React from 'react';
import MaUTable from '@material-ui/core/Table';
import PropTypes from 'prop-types';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TablePaginationActions from './TablePaginationActions';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {
	useBlockLayout,
	useGlobalFilter,
	usePagination,
	useRowSelect,
	useSortBy,
	useResizeColumns,
	useTable
} from 'react-table';
import clsx from 'clsx';

// import ContactsTablePaginationActions from './ContactsTablePaginationActions';

// const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
// 	const defaultRef = React.useRef();
// 	const resolvedRef = ref || defaultRef;

// 	React.useEffect(() => {
// 		resolvedRef.current.indeterminate = indeterminate;
// 	}, [resolvedRef, indeterminate]);

// 	return (
// 		<>
// 			<Checkbox ref={resolvedRef} {...rest} />
// 		</>
// 	);
// });

const EnhancedTable = ({
	columns,
	data,
	defaultColumn,
	pageSize: controlledPageSize,
	// pageOptions: controlledPageOptions,
	showHeader = true,
	showFooter = true,
	rowClick = true,
	onRowClick
}) => {
	const {
		getTableProps,
		headerGroups,
		prepareRow,
		page,
		gotoPage,
		setPageSize,
		state: { pageIndex, pageSize }
	} = useTable(
		{
			columns,
			data,
			defaultColumn,
			initialState: { pageSize: controlledPageSize || 10 },
			autoResetPage: true
		},
		useBlockLayout,
		useGlobalFilter,
		useSortBy,
		usePagination,
		useRowSelect,
		useResizeColumns
		// hooks => {
		// 	hooks.allColumns.push(_columns => [
		// 		// Let's make a column for selection
		// 		{
		// 			id: 'selection',
		// 			sortable: false,
		// 			// The header can use the table's getToggleAllRowsSelectedProps method
		// 			// to render a checkbox.  Pagination is a problem since this will select all
		// 			// rows even though not all rows are on the current page.  The solution should
		// 			// be server side pagination.  For one, the clients should not download all
		// 			// rows in most cases.  The client should only download data for the current page.
		// 			// In that case, getToggleAllRowsSelectedProps works fine.
		// 			Header: ({ getToggleAllRowsSelectedProps }) => (
		// 				<div>
		// 					<IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
		// 				</div>
		// 			),
		// 			// The cell can use the individual row's getToggleRowSelectedProps method
		// 			// to the render a checkbox
		// 			Cell: ({ row }) => (
		// 				<div>
		// 					<IndeterminateCheckbox
		// 						{...row.getToggleRowSelectedProps()}
		// 						onClick={ev => ev.stopPropagation()}
		// 					/>
		// 				</div>
		// 			)
		// 		},
		// 		..._columns
		// 	]);
		// }
	);

	const handleChangePage = (event, newPage) => {
		gotoPage(newPage);
	};

	const handleChangeRowsPerPage = event => {
		setPageSize(Number(event.target.value));
	};

	// Render the UI for your table
	return (
		<MaUTable {...getTableProps()} size="small" className={showFooter ? '' : 'mb-20'}>
			<TableHead className={showHeader ? '' : 'hidden'}>
				{headerGroups.map(headerGroup => (
					<TableRow {...headerGroup.getHeaderGroupProps()}>
						{headerGroup.headers.map(column => (
							<TableCell
								className="whitespace-no-wrap px-12"
								{...(!column.sortable
									? column.getHeaderProps()
									: column.getHeaderProps(column.getSortByToggleProps()))}
							>
								{column.render('Header')}
								{column.sortable ? (
									<TableSortLabel
										active={column.isSorted}
										// react-table has a unsorted state which is not treated here
										direction={column.isSortedDesc ? 'desc' : 'asc'}
									/>
								) : null}
								<div
									{...column.getResizerProps()}
									className={`resize-x resizer ${column.isResizing ? 'isResizing' : ''}`}
								/>
							</TableCell>
						))}
					</TableRow>
				))}
			</TableHead>
			<TableBody>
				{page.map((row, i) => {
					prepareRow(row);
					return (
						<TableRow
							{...row.getRowProps()}
							onClick={ev => onRowClick(ev, row)}
							className={clsx('truncate', rowClick ? 'cursor-pointer' : 'cursor-default')}
						>
							{row.cells.map(cell => {
								return (
									<TableCell
										{...cell.getCellProps()}
										className={clsx('px-12 py-6', cell.column.className)}
									>
										{cell.render('Cell')}
									</TableCell>
								);
							})}
						</TableRow>
					);
				})}
			</TableBody>

			<TableFooter className={showFooter ? '' : 'hidden'}>
				<TableRow>
					<TablePagination
						classes={{
							root: 'overflow-hidden',
							spacer: 'w-0 max-w-0'
						}}
						rowsPerPageOptions={[5, 10, 25, { label: 'All', value: data.length }]}
						colSpan={9}
						count={data.length}
						rowsPerPage={pageSize}
						page={pageIndex}
						SelectProps={{
							inputProps: { 'aria-label': 'rows per page' },
							native: false
						}}
						onChangePage={handleChangePage}
						onChangeRowsPerPage={handleChangeRowsPerPage}
						ActionsComponent={TablePaginationActions}
					/>
				</TableRow>
			</TableFooter>
		</MaUTable>
	);
};

EnhancedTable.propTypes = {
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
	onRowClick: PropTypes.func
};

export default EnhancedTable;
