import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NewsArticles from '../NewsArticles';
import RelatedCompany from '../RelatedCompany';
import { getNews, getNewsSA, getRelatedCompany } from 'app/main/apps/company/store/searchsSlice';

function StockNewsContainer(props) {
	const { selectedCode } = props;
	const dispatch = useDispatch();
	const searchText = selectedCode && selectedCode.corpName ? selectedCode.corpName : '주식';

	useEffect(() => {
		dispatch(getNews({ params: { searchText: searchText, searchNum: '' }, subParams: {} })).then(() => {
			dispatch(getNewsSA({ params: { searchText: searchText, searchNum: '' }, subParams: {} }));
			dispatch(getRelatedCompany({ params: { searchText: searchText, searchNum: '' }, subParams: {} }));
		});

		// eslint-disable-next-line
	}, [selectedCode]);

	return (
		<div className="w-full h-full">
			<NewsArticles />
			{searchText === '주식' && <RelatedCompany />}
		</div>
	);
}

export default StockNewsContainer;
