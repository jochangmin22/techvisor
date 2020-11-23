import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import EnhancedTable from 'app/main/apps/lib/EnhancedTableWithPagination';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useMemo } from 'react';

const columns = [
	{
		Header: '순번',
		accessor: '순번',
		className: 'text-14 text-left',
		sortable: true,
		width: 60
	},
	{
		Header: '종류',
		accessor: '종류',
		className: 'text-14 text-left',
		sortable: true,
		width: 100
	},
	{
		Header: '항목',
		accessor: '항목',
		className: 'text-14 text-left',
		sortable: true,
		width: 100
	},
	{
		Header: '사용포인트',
		accessor: '사용포인트',
		className: 'text-14 text-left',
		sortable: true,
		width: 150
	},
	{
		Header: '다운로드 파일',
		accessor: '다운로드 파일',
		className: 'text-14 text-left',
		sortable: true,
		width: 150
	},
	{
		Header: '다운로드 일시',
		accessor: '다운로드 일시',
		className: 'text-14 text-left',
		sortable: true,
		width: 100
	},
	{
		Header: '다운로드 가능일자',
		accessor: '다운로드 가능일자',
		className: 'text-14 text-left',
		sortable: true,
		width: 100
	}
];

function UserDownloadTab() {
	const userDownload = [];
	const data = useMemo(() => (userDownload ? userDownload : []), [userDownload]);
	useEffect(() => {}, [data]);

	if (!userDownload) {
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
						다운로드
					</Typography>
					<div className="flex flex-row justify-between mb-16">
						<div classname="font-semibold">다운로드 정보</div>
						<div className="text-red font-normal">
							다운로드 파일은 3일간만 보관되오니 유의하시길 바랍니다.
						</div>
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

export default UserDownloadTab;
