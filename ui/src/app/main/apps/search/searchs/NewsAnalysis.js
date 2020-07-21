/* eslint-disable */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import NewsArticles from './components/NewsArticles';
import RelatedCompany from './components/RelatedCompany';
import { getNews, getNewsSA, getRelatedCompany } from '../store/searchsSlice';
import PopoverMsg from 'app/main/apps/lib/PopoverMsg';

function NewsAnalysis(props) {
	const { searchText } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(getNews({ searchText: searchText })).then(() => {
			dispatch(getNewsSA({ searchText: searchText }));
			dispatch(getRelatedCompany({ searchText: searchText }));
		});
	}, [searchText]);

	return (
		<Paper className="w-full h-full rounded-8 shadow">
			<div className="px-12 flex items-center">
				<PopoverMsg
					title="뉴스분석"
					msg="검색어와 관련하여 머신러닝 기술을 기반으로 최근 100건의 뉴스의 긍정부정을 판단합니다."
				/>
			</div>
			<NewsArticles searchText={searchText} />
			<RelatedCompany searchText={searchText} />
		</Paper>
	);
}

export default NewsAnalysis;
