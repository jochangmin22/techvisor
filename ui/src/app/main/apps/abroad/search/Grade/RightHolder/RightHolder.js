import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const columns = [
	{
		Header: '순위번호',
		accessor: '순위번호',
		className: 'text-14 text-left',
		sortable: true,
		width: 180
	},
	{
		Header: '권리자정보',
		accessor: '권리자정보',
		className: 'text-14 text-left',
		sortable: true
	},
	{
		Header: '등록일자',
		accessor: '등록일자',
		className: 'text-14 text-left',
		sortable: true,
		width: 110
	}
];

function GradeTableRightHolder(props) {
	const rightHolder = useSelector(({ abroadApp }) => abroadApp.search.rightHolder);
	const data = useMemo(() => (rightHolder ? rightHolder : []), [rightHolder]);
	useEffect(() => {}, [data]);

	if (!data) {
		return <SpinLoading delay={20000} className="h-full" />;
	}

	return (
		<FuseScrollbars className="max-h-512 mx-8">
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
