import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMockData } from './store/searchsSlice';
// import { authRoles } from "app/auth";
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import NoResultMsg from 'app/main/apps/lib/NoResultMsg';
import searchData from 'app/main/apps/lib/mockDataCompanyApp';
import MainTable from './searchs/SearchList/MainTable';
import SearchsContainer from './searchs/SearchsContainer';

function CompanyContent(props) {
	const dispatch = useDispatch();
	const entities = useSelector(({ companyApp }) => companyApp.searchs.entities);
	const searchText = useSelector(({ companyApp }) => companyApp.searchs.searchParams.searchText);
	const searchLoading = useSelector(({ companyApp }) => companyApp.searchs.searchLoading);

	// 개발용 mock data 넣기
	useEffect(() => {
		dispatch(setMockData(searchData));
		// eslint-disable-next-line
	}, []);

	const noResult = !!(!searchLoading && entities && entities.length === 0);
	const pleaseChooseOne = !!(!searchLoading && entities && entities.length > 1);

	if (noResult) {
		return <NoResultMsg />;
	}

	if (!searchText) {
		return <EmptyMsg icon="chat" msg="검색결과" />;
	}

	if (pleaseChooseOne) {
		return (
			<div className="flex flex-wrap w-full h-460 items-start justify-center mt-16">
				<div className="flex w-full h-auto p-16 md:pt-0">
					<MainTable />
				</div>
				<div className="flex h-full items-center justify-center px-24">
					<EmptyMsg icon="mouse" msg="기업을 선택하세요" text="위의 검색 결과에서 기업을 클릭하세요!.." />
				</div>
			</div>
		);
	}

	return <SearchsContainer />;
}

export default CompanyContent;
