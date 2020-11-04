import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FuseAnimate from '@fuse/core/FuseAnimate';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

const columns = [
	{
		Header: '일자',
		accessor: '법적상태일자',
		className: 'text-12 text-gray-500 text-left',
		sortable: true,
		width: 100
	},
	{
		Header: '종류',
		accessor: '법적상태명',
		className: 'text-13 text-left',
		sortable: true,
		width: 120,
		Cell: row => {
			let statusColor = null;
			if (['거절', '취하'].some(el => row.value.includes(el))) {
				// if (row.value.includes('거절')) {
				statusColor = 'red';
			} else if (['등록'].some(el => row.value.includes(el))) {
				statusColor = 'green';
			} else {
				statusColor = null;
			}
			return (
				<span
					style={{
						color: statusColor
					}}
				>
					{row.value}
				</span>
			);
		}
	},
	{
		Header: '설명',
		accessor: '법적상태영문명',
		className: 'text-13 text-left',
		sortable: true,
		width: 500
	}
];

function LegalStatus(props) {
	const entities = useSelector(({ searchApp }) => searchApp.search.legal);
	const data = useMemo(() => (entities ? entities : []), [entities]);
	useEffect(() => {}, [data]);

	const showFooter = entities && entities.length > 10 ? true : false;

	if (!entities) {
		return <SpinLoading className="h-200" />;
	}

	if (entities && entities.length === 0) {
		return (
			<Paper className="w-full rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">법적 상태</Typography>
				<div className="max-w-512 text-center">
					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							조회된 법적 상태 내용이 없습니다.
						</Typography>
					</FuseAnimate>
				</div>
			</Paper>
		);
	}
	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<Typography className="p-16 pl-28 text-14 font-bold">법적 상태</Typography>
			<FuseScrollbars className="max-h-512 mx-8">
				<EnhancedTable
					columns={columns}
					data={data}
					size="small"
					showFooter={showFooter}
					rowClick={false}
					onRowClick={(ev, row) => {
						if (row) {
							// props.history.push(`/apps/search/${row.original.출원번호}`);
						}
					}}
				/>
			</FuseScrollbars>
		</Paper>
	);
}

export default LegalStatus;
