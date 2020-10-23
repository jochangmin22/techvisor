import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NewsArticles from '../NewsArticles';
import RelatedCompany from '../RelatedCompany';
import { getNews, getNewsSA, getRelatedCompany } from 'app/main/apps/company/store/searchsSlice';

function StockNewsContainer(props) {
	const { selectedCorp } = props;
	const dispatch = useDispatch();
	const searchWord = selectedCorp && selectedCorp.corpName ? selectedCorp.corpName : '주식';

	useEffect(() => {
		// It borrows the redux of searchApp, so searchText is required.
		dispatch(getNews({ params: { searchText: searchWord }, subParams: {} })).then(() => {
			dispatch(getNewsSA({ params: { searchText: searchWord }, subParams: {} }));
			dispatch(getRelatedCompany({ params: { searchText: searchWord }, subParams: {} }));
		});

		// eslint-disable-next-line
	}, [searchWord]);

	return (
		<div className="w-full h-full">
			<NewsArticles />
			<RelatedCompany />
		</div>
	);
}

export default StockNewsContainer;
