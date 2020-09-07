import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import searchData from 'app/main/apps/lib/mockDataCompanyApp';
import ContentTable from './searchs/ContentTable';

function CompanyContent(props) {
	const dispatch = useDispatch();
	const searchs = useSelector(({ companyApp }) => companyApp.searchs);
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
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
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
							<div>기업선택</div>
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
							<div>기업개요</div>
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
							<div>특허통계분석 </div>
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
							<div>매트릭스분석</div>
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
							<div>뉴스분석</div>
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
							<div>임상정보</div>
						</div>
						<div className="flex w-full h-full p-16 md:pt-0">
							<ContentTable />
						</div>
					</div>
				)}
			</FuseAnimateGroup>
		</div>
	);
}

export default CompanyContent;
