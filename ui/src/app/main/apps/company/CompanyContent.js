import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import ContentGrid from './searchs/ContentGrid';
// import ContentVisual from './searchs/ContentVisual';
// import SubjectRelation from './searchs/SubjectRelation';
// import MatrixAnalysis from './searchs/MatrixAnalysis';
// import NewsRelation from './searchs/NewsRelation';
import EmptyMsg from './searchs/components/EmptyMsg';
import searchData from './inc/searchData';

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
					<div className="flex flex-wrap w-full h-384 items-start justify-center">
						{/* <div className="flex flex-col w-full h-full md:w-1/2 p-16">
							<SubjectRelation searchText={searchText} searchNum={searchNum} />
						</div>
						<div className="flex flex-col w-full h-full md:w-1/2 p-16 pl-0">
							<ContentVisual searchText={searchText} inventor={inventor} assignee={assignee} />
						</div>
						<div className="flex flex-col w-full h-full md:w-1/2 p-16 pt-0">
							<MatrixAnalysis searchText={searchText} searchNum={searchNum} />
						</div>
						<div className="flex flex-col w-full h-full md:w-1/2 p-16 pt-0 pl-0">
							<NewsRelation searchText={searchText} />
						</div> */}
						<ContentGrid />
					</div>
				)}
			</FuseAnimateGroup>
		</div>
	);
}

export default CompanyContent;
