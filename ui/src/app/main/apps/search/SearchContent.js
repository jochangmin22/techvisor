import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FuseAnimateGroup from '@fuse/core/FuseAnimateGroup';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
// import ContentGrid from './searchs/ContentGrid';
import VisualContainer from './searchs/Visual/VisualContainer';
import KeywordsContainer from './searchs/Keywords/KeywordsContainer';
import MatrixAnalysis from './searchs/Matrix/MatrixAnalysis';
import NewsAnalysis from './searchs/News/NewsAnalysis';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import searchData from 'app/main/apps/lib/searchDataNew';
import MainTable from './searchs/SearchList/MainTable';

function SearchContent(props) {
	const dispatch = useDispatch();
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const { searchText, searchNum, inventor, assignee } = searchParams;
	const searchs = useSelector(({ searchApp }) => searchApp.searchs.entities);
	const searchLoading = useSelector(({ searchApp }) => searchApp.searchs.searchLoading);

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
				{!searchText && !inventor && !assignee ? (
					<EmptyMsg icon="chat" msg="검색결과" />
				) : (
					<div className="flex flex-wrap w-full h-460 items-start justify-center">
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
							<KeywordsContainer />
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pl-0 md:pt-0">
							<VisualContainer searchText={searchText} inventor={inventor} assignee={assignee} />
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0">
							<MatrixAnalysis searchText={searchText} searchNum={searchNum} />
						</div>
						<div className="flex w-full h-full md:w-1/2 p-16 pb-0 md:p-16 md:pt-0 md:pl-0">
							<NewsAnalysis searchText={searchText} />
						</div>
						<div className="flex w-full h-full p-16 md:pt-0">
							{/* <ContentGrid /> */}
							<MainTable />
						</div>
					</div>
				)}
			</FuseAnimateGroup>
		</div>
	);
}

export default SearchContent;
