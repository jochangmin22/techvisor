// eslint-disable
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { useTable, useBlockLayout, usePagination } from 'react-table';
import { FixedSizeList } from 'react-window';
import FuseAnimate from '@fuse/core/FuseAnimate';
// import { useDispatch, useSelector } from "react-redux";
// import { Checkbox, Icon, IconButton } from "@material-ui/core";

function Table({ columns, data, fetchData, loading, pageCount: controlledPageCount }) {
	// Use the state and functions returned from useTable to build your UI
	const {
		getTableProps,
		headerGroups,
		rows,
		totalColumnsWidth,
		prepareRow,
		page,
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nexPage,
		previousPage,
		setPageSize,
		state: { pageIndex, pageSize }
	} = useTable(
		{
			columns,
			data,
			manualPagination: true,
			pageCount: controlledPageCount
		},
		useBlockLayout,
		usePagination
	);

	useEffect(() => {
		fetchData({ pageIndex, pageSize });
	}, [fetchData, pageIndex, pageSize]);
	// <TableBody>
	//     {rows.map((row, i) => {
	//         prepareRow(row);
	//         return (
	//             <TableRow {...row.getRowProps()}>
	//                 {row.cells.map(cell => {
	//                     return (
	//                         <TableCell {...cell.getCellProps()}>
	//                             {cell.render("Cell")}
	//                         </TableCell>
	//                     );
	//                 })}
	//             </TableRow>
	//         );
	//     })}
	// </TableBody>;

	const RenderRow = useCallback(
		({ index, style }) => {
			const row = rows[index];
			prepareRow(row);
			return (
				<TableRow {...row.getRowProps({ style })}>
					{row.cells.map(cell => {
						return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
					})}
				</TableRow>
			);
		},
		[prepareRow, rows]
	);

	// Render the UI for your table
	return (
		<>
			<MaUTable {...getTableProps()}>
				<TableHead>
					{headerGroups.map(headerGroup => (
						<TableRow {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map(column => (
								<TableCell {...column.getHeaderProps()}>{column.render('Header')}</TableCell>
							))}
						</TableRow>
					))}
				</TableHead>
				<TableBody>
					<FixedSizeList height={100} itemCount={rows.length} itemSize={35} width={totalColumnsWidth}>
						{RenderRow}
					</FixedSizeList>
					<tr>
						{loading ? (
							<td colSpan="4">Loading...</td>
						) : (
							<td colSpan="4">
								Showing {page.length} of ~{controlledPageCount * pageSize} results
							</td>
						)}
					</tr>
				</TableBody>
			</MaUTable>
			<div className="pagination"></div>
		</>
	);
}

function ClassifyHeaderList(props) {
	// const dispatch = useDispatch();
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [pageCount, setPageCount] = useState(0);
	const fetchIdRef = useRef(0);

	const fetchData = useCallback(({ pageSize, pageIndex }) => {
		const fetchId = ++fetchIdRef.current;
		setLoading(true);
		setTimeout(() => {
			if (fetchId === fetchIdRef.current) {
				const startRow = pageSize * pageIndex;
				const endRow = startRow * pageSize;
				setData(props.data.slice(startRow, endRow));
				setPageCount(Math.ceil(props.data.length / pageSize));
				setLoading(false);
			}
		}, 1000);
	}, []);

	const columns = useMemo(
		() => [
			{
				Header: '등록사항',
				id: '등록사항',
				accessor: '등록사항'
			},
			{
				Header: '발명의명칭(국문)',
				id: '발명의명칭(국문)',
				accessor: '발명의명칭(국문)'
			},
			{
				Header: '출원번호',
				id: '출원번호',
				accessor: '출원번호'
			},
			{
				Header: '출원일',
				id: '출원일자',
				accessor: '출원일자'
			}
		],
		[]
	);

	// const data = useMemo(() => props.data, []);

	return (
		<FuseAnimate animation="transition.slideUpIn" delay={300}>
			<Table
				data={data}
				columns={columns}
				fetchData={fetchData}
				loading={loading}
				pageCount={pageCount}
				// initialState: { pageSize: 5 }
				// defaultPageSize={5}
				// className="-striped -highlight"
			/>
		</FuseAnimate>
	);
}

export default ClassifyHeaderList;
