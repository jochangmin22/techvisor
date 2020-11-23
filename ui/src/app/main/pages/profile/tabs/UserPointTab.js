import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useMemo } from 'react';

const columns = [
	{
		Header: '일자',
		Footer: '합계',
		accessor: '일자',
		className: 'text-14 text-center',
		sortable: true,
		width: 60
	},
	{
		Header: '다운로드',
		className: 'text-14 text-center',
		columns: [
			{
				Header: '기술검색',
				accessor: '기술검색',
				Footer: 기술검색 => {
					// Only calculate total visits if rows change
					const total = React.useMemo(() => 기술검색.rows.reduce((sum, row) => row.values.visits + sum, 0), [
						기술검색.rows
					]);

					return <>{total}</>;
				},
				className: 'text-14 text-center',
				sortable: true,
				width: 150
			},
			{
				Header: '기업검색',
				accessor: '기업검색',
				Footer: 기업검색 => {
					// Only calculate total visits if rows change
					const total = React.useMemo(() => 기업검색.rows.reduce((sum, row) => row.values.visits + sum, 0), [
						기업검색.rows
					]);

					return <>{total}</>;
				},
				className: 'text-14 text-center',
				sortable: true,
				width: 150
			}
		]
	},

	{
		Header: '전체사용 포인트',
		accessor: '전체사용 포인트',
		className: 'text-14 text-center',
		sortable: true,
		width: 100
	}
];

function UserPointTab() {
	const userPoint = [];
	const data = useMemo(() => (userPoint ? userPoint : []), [userPoint]);
	useEffect(() => {}, [data]);

	if (!userPoint) {
		return '';
	}

	return (
		<div className="md:flex max-w-2xl">
			<div className="flex flex-col flex-1 md:ltr:pr-32 md:rtl:pl-32">
				<FuseAnimateGroup
					enter={{
						animation: 'transition.slideUpBigIn'
					}}
				>
					<Typography variant="h6" color="inherit" className="flex-1 px-12 mb-16">
						포인트 이용내역
					</Typography>
					<div className="mb-16">보유포인트</div>
					<div className="mb-16">계약정보</div>
					<div className="flex flex-row justify-between mb-16">
						<div classname="font-semibold">조회기간</div>
					</div>
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
				</FuseAnimateGroup>
			</div>
		</div>
	);
}

export default UserPointTab;
