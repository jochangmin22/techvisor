import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import NewsArticles from '../NewsArticles';
import RelatedCompany from '../RelatedCompany';
import { getNews, getNewsSA, getRelatedCompany } from 'app/main/apps/company/store/searchsSlice';

function StockNewsContainer(props) {
	const dispatch = useDispatch();
	const { selectCode } = props;

	useEffect(() => {
		if (selectCode && selectCode.length > 0) {
			dispatch(getNews({ params: { searchText: selectCode, searchNum: '' }, subParams: {} })).then(() => {
				dispatch(getNewsSA({ params: { searchText: selectCode, searchNum: '' }, subParams: {} }));
				dispatch(getRelatedCompany({ params: { searchText: selectCode, searchNum: '' }, subParams: {} }));
			});
		}
		// eslint-disable-next-line
	}, [selectCode]);

	return (
		<div className="w-full h-full">
			<NewsArticles selectCode={selectCode} />
			{selectCode === '주식' && <RelatedCompany selectCode={selectCode} />}
		</div>
	);
}

export default StockNewsContainer;
