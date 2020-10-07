import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Typography from '@material-ui/core/Typography';
import FuseAnimate from '@fuse/core/FuseAnimate';

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
		accessor: 'similarity',
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
	const { data } = props;
	useEffect(() => {}, [data]);

	if (!data) {
		return '';
	}

	if (data && data.length === 0) {
		return (
			<div className="flex flex-col flex-1 items-center justify-center p-16">
				<div className="max-w-512 text-center">
					<FuseAnimate delay={500}>
						<Typography variant="h5" color="textSecondary" className="mb-16">
							검색된 유사특허가 없습니다.
						</Typography>
					</FuseAnimate>

					<FuseAnimate delay={600}>
						<Typography variant="subtitle1" color="textSecondary" className="mb-48">
							유사도가 높은 특허가 발견되지 않았습니다.
						</Typography>
					</FuseAnimate>
				</div>
			</div>
		);
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
