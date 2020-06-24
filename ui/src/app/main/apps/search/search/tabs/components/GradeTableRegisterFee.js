import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

const columns = [
	{
		Header: '납입일',
		accessor: '납입일',
		className: 'text-14 text-center',
		sortable: true,
		width: 180
	},
	{
		Header: '납입년차',
		accessor: '납입년차',
		className: 'text-14 text-center',
		sortable: true,
		width: 120
	},
	{
		Header: '납입금액',
		accessor: '납입금액',
		className: 'text-14 text-center',
		sortable: true,
		width: 180
	}
	// {
	// 	Header: '감면사유',
	// 	accessor: '감면사유',
	// 	className: 'text-14 text-left',
	// 	sortable: true,
	// 	width: 80
	// },
	// {
	// 	Header: '반환사유',
	// 	accessor: '반환사유',
	// 	className: 'text-14 text-left',
	// 	sortable: true,
	// 	width: 120
	// },
	// {
	// 	Header: '반환금액',
	// 	accessor: '반환금액',
	// 	className: 'text-14 text-left',
	// 	sortable: true,
	// 	width: 80
	// },
	// {
	// 	Header: '반환일자',
	// 	accessor: '반환일자',
	// 	className: 'text-14 text-left',
	// 	sortable: true,
	// 	width: 120
	// }
];

function GradeTableRightHolder(props) {
	const registerFee = useSelector(({ searchApp }) => searchApp.search.registerFee);
	const data = useMemo(() => (registerFee ? registerFee : []), [registerFee]);
	useEffect(() => {}, [data]);

	if (!registerFee) {
		return '';
	}

	return (
		<FuseScrollbars className="max-h-512 px-6">
			<EnhancedTable
				columns={columns}
				data={data}
				size="small"
				showFooter={false}
				onRowClick={(ev, row) => {
					if (row) {
						// props.history.push(`/apps/search/${row.original.출원번호}`);
					}
				}}
			/>
		</FuseScrollbars>
	);
}

export default GradeTableRightHolder;
