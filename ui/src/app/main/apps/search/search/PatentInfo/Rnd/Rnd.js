import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

const column = [
	{ Header: '과제번호', accessor: '과제번호', className: 'text-13  font-bold', sortable: true, width: 80 },
	{ Header: '과제명', accessor: '과제명', className: 'text-13 font-bold', sortable: true, width: 80 },
	{ Header: '사업명', accessor: '사업명', className: 'text-12 text-gray-500', sortable: true, width: 80 },
	{ Header: '연구기간', accessor: '연구기간', className: 'text-12 text-gray-500', sortable: true, width: 80 },
	{ Header: '부처명', accessor: '부처명', className: 'text-12 text-gray-500', sortable: true, width: 80 },
	{ Header: '주관기관', accessor: '주관기관', className: 'text-12 text-gray-500', sortable: true, width: 80 },
	{
		Header: '연구관리전문기관',
		accessor: '전문기관',
		className: 'text-12 text-gray-500',
		sortable: true,
		width: 80
	},
	{ Header: '기여율', accessor: '기여율', className: 'text-12 text-gray-500', sortable: true, width: 80 }
];

function Rnd() {
	const entities = useSelector(({ searchApp }) => searchApp.search.rnd);
	const data = useMemo(() => (entities ? entities : []), [entities]);

	const showFooter = entities && entities.length > 10 ? true : false;

	if (!entities) {
		return <SpinLoading className="h-200" />;
	}

	if (entities && entities.length === 0) {
		return (
			<Paper className="w-full rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">국가연구개발사업</Typography>
				<div className="max-w-512 text-center">
					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							조회된 R&D사업이 없습니다.
						</Typography>
					</FuseAnimate>
				</div>
			</Paper>
		);
	}

	return (
		<Paper className="w-full rounded-8 shadow mb-16">
			<Typography className="p-16 pl-28 text-14 font-bold">국가연구개발사업</Typography>
			<FuseScrollbars className="max-h-512 mx-8">
				<EnhancedTable
					columns={column}
					data={data}
					size="small"
					rowClick={false}
					showFooter={showFooter}
					onRowClick={(ev, row) => {}}
				/>
			</FuseScrollbars>
		</Paper>
	);
}

export default Rnd;
