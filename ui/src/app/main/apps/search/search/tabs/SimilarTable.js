import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

const columns = [
	{
		Header: '출원번호',
		accessor: '출원번호',
		className: 'text-14 text-left',
		sortable: true,
		width: 180
	},
	{
		Header: '유사도',
		accessor: '유사도',
		className: 'text-14 text-left',
		sortable: true,
		width: 90
	},
	{
		Header: '출원일',
		accessor: '출원일자',
		className: 'text-14 text-left',
		sortable: true,
		width: 110
	},
	{
		Header: '상태',
		accessor: '등록사항',
		className: 'text-14 text-left',
		sortable: true,
		width: 80
	},
	{
		Header: '발명의명칭(국문)',
		accessor: '발명의명칭(국문)',
		className: 'text-14 text-left',
		sortable: true,
		width: 500
	},
	{
		Header: '출원인',
		accessor: '출원인1',
		className: 'text-14 text-left',
		sortable: true,
		width: 250
	},
	{
		Header: '발명자',
		accessor: '발명자1',
		className: 'text-14 text-left',
		sortable: true,
		width: 100
	},
	{
		Header: 'IPC',
		accessor: 'ipc요약',
		className: 'text-14 text-left',
		sortable: true,
		width: 75
	}
];

function SimilarTable(props) {
	const entities = useSelector(({ searchApp }) => searchApp.search.similar.entities);
	const data = useMemo(() => (entities ? entities : []), [entities]);
	useEffect(() => {}, [data]);

	if (!entities) {
		return '';
	}

	return (
		<FuseScrollbars className="max-h-512 px-6">
			<EnhancedTable
				columns={columns}
				data={data}
				size="small"
				onRowClick={(ev, row) => {
					if (row) {
						props.history.push(`/apps/search/${row.original.출원번호}`);
					}
				}}
			/>
		</FuseScrollbars>
	);
}

export default withRouter(SimilarTable);
