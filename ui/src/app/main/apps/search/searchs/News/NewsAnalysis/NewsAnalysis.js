import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import NewsArticles from '../NewsArticles';
import RelatedCompany from '../RelatedCompany';
import { getNews, getNewsSA, getRelatedCompany } from 'app/main/apps/search/store/searchsSlice';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';
import EmptyMsg from 'app/main/apps/lib/EmptyMsg';
import DraggableIcon from 'app/main/apps/lib/DraggableIcon';
import parseSearchOptions from 'app/main/apps/lib/parseSearchText';
import { useSelector } from 'react-redux';

function NewsAnalysis() {
	const dispatch = useDispatch();
	const searchParams = useSelector(({ searchApp }) => searchApp.searchs.searchParams);
	const { searchText } = searchParams;
	const analysisOptions = useSelector(({ searchApp }) => searchApp.searchs.analysisOptions);

	useEffect(() => {
		if (searchText && searchText.length > 0) {
			const [, params] = parseSearchOptions(searchParams);
			const subParams = { analysisOptions: analysisOptions };
			dispatch(getNews({ params, subParams })).then(() => {
				dispatch(getNewsSA({ params, subParams }));
				dispatch(getRelatedCompany({ params, subParams }));
			});
		}
		// eslint-disable-next-line
	}, [searchText]);

	return (
		<Paper className="w-full h-full rounded-8 shadow">
			<div className="px-12 flex items-center">
				<div className="flex flex-row items-center">
					<PopoverMsg
						title="뉴스분석"
						msg="검색어와 관련하여 머신러닝 기술을 기반으로 최근 100건의 뉴스의 긍정부정을 판단합니다."
					/>
					<DraggableIcon />
				</div>
			</div>
			{searchText.length === 0 ? (
				<EmptyMsg icon="mic_none" msg="뉴스분석" text="키워드 검색에서만 관련 뉴스가 표시됩니다." />
			) : (
				<>
					<NewsArticles />
					<RelatedCompany searchText={searchText} />
				</>
			)}
		</Paper>
	);
}

export default NewsAnalysis;
