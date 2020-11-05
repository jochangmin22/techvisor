import React, { useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FamilyTree from '../FamilyTree';
// import FamilyMap from './components/FamilyMap';
import SpinLoading from 'app/main/apps/lib/SpinLoading';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { withRouter } from 'react-router-dom';

const columns = [
	{
		Header: '국가코드',
		accessor: '국가코드',
		className: 'text-12 text-gray-500 text-left',
		sortable: true,
		width: 80
	},
	{
		Header: '문헌번호',
		accessor: '패밀리번호',
		className: 'text-12 text-gray-500 text-left',
		sortable: true,
		width: 120
	},
	{
		Header: '일자',
		accessor: '일자',
		className: 'text-12 text-left',
		sortable: true,
		width: 120
	},
	{
		Header: '발명의 명칭',
		accessor: '명칭',
		className: 'text-12 text-left',
		sortable: true,
		width: 500
	},
	{
		Header: 'IPC',
		accessor: 'IPC',
		className: 'text-12 text-left',
		sortable: true,
		width: 120
	},
	{
		Header: 'CPC',
		accessor: 'CPC',
		className: 'text-12 text-left',
		sortable: true,
		width: 120
	}
];

function Family() {
	const entities = useSelector(({ searchApp }) => searchApp.search.family);

	const data = useMemo(() => (entities ? entities : []), [entities]);
	useEffect(() => {}, [data]);

	const showFooter = entities && entities.length > 10 ? true : false;

	if (!entities) {
		return <SpinLoading className="h-200" />;
	}

	if (entities && entities.length === 0) {
		return (
			<Paper className="w-full rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">패밀리 특허문헌</Typography>
				<div className="max-w-512 text-center">
					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							조회된 패밀리 특허가 없습니다.
						</Typography>
					</FuseAnimate>
				</div>
			</Paper>
		);
	}

	return (
		<>
			<Paper className="w-full rounded-8 shadow mb-16">
				<Typography className="p-16 pl-28 text-14 font-bold">패밀리 특허문헌</Typography>
				<div className="px-16">
					<FamilyTree data={data} />
				</div>
				<FuseScrollbars className="max-h-512 mx-8">
					<EnhancedTable
						columns={columns}
						data={data}
						size="small"
						showFooter={showFooter}
						// rowClick={false}
						onRowClick={(ev, row) => {
							if (row) {
								// props.history.push(`/apps/search/${row.original.출원번호}`);
							}
						}}
					/>
				</FuseScrollbars>
			</Paper>
			{/* <FamilyMap appNo={props.appNo} data={data} /> */}
		</>
	);
}

export default withRouter(Family);
