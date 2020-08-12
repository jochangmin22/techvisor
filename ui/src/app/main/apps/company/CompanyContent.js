import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import EmptyMsg from './searchs/components/EmptyMsg';
import searchData from 'app/main/apps/lib/searchDataNew';
import ContentTable from './searchs/ContentTable';

function CompanyContent(props) {
	const dispatch = useDispatch();
	const searchParams = useSelector(({ companyApp }) => companyApp.searchs.searchParams);
	const { searchText } = searchParams;
	const searchs = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);

	// 개발용 mock data 넣기
	useEffect(() => {
		dispatch(setMockData(searchData));
		// eslint-disable-next-line
	}, []);

	if (!searchLoading && searchs && searchs.length === 0) {
		return (
			<div className="flex flex-col flex-1 h-full items-center justify-center px-24">
				<Typography variant="h6" className="my-12">
					검색결과가 없습니다.
				</Typography>
			</div>
		);
	}

	return (
		<div className="flex h-full items-center justify-center">
			<FuseAnimateGroup
				className="flex h-full w-full"
				enter={{
					animation: 'transition.slideUpBigIn'
				}}
			>
				{!searchText ? (
					<EmptyMsg icon="chat" msg="검색결과" />
				) : (
					<div className="flex flex-wrap w-full h-460 items-start justify-center">
						<ContentTable />
					</div>
				)}
			</FuseAnimateGroup>
		</div>
	);
}

export default CompanyContent;
