/* eslint-disable */
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import Paper from '@material-ui/core/Paper';
import NewsContext from './NewsContext';
import NewsAnalysis from './components/NewsAnalysis';
import NewsArticles from './components/NewsArticles';
import RelatedCompany from './components/RelatedCompany';
import withReducer from 'app/store/withReducer';
import * as Actions from '../store/actions';
import reducer from 'app/store/reducers';
import SpinLoading from 'app/main/apps/lib/SpinLoading';

function NewsRelation(props) {
	const { searchText } = props;
	const dispatch = useDispatch();
	// const newsAnalysis = useSelector(({ searchApp }) => searchApp.searchs.newsAnalysis);

	// const [vecData, setVecData] = useState(null);
	const [newsAnalysis] = useState([50, 50]);
	const [showLoading, setShowLoading] = useState(false);

	const showLoadingValue = useMemo(() => ({ showLoading, setShowLoading }), [showLoading, setShowLoading]);

	useEffect(() => {
		dispatch(Actions.getNews({ searchText: searchText })).then(() => {
			dispatch(Actions.getRelatedCompany({ searchText: searchText }));
		});
	}, [searchText]);
	// useEffect(() => {
	// 	if (newsAnalysis === null) {
	// 		setVecData(null);
	// 	} else {
	// 		if (newsAnalysis.vec !== undefined) {
	// 			setVecData(newsAnalysis.vec);
	// 		}
	// 	}
	// }, [newsAnalysis]);

	if (!newsAnalysis || newsAnalysis.length === 0) {
		return <SpinLoading />;
	}

	return (
		<NewsContext.Provider value={showLoadingValue}>
			<Paper className="w-full h-full rounded-8 shadow">
				<NewsAnalysis searchText={searchText} />
				<NewsArticles searchText={searchText} />
				<RelatedCompany searchText={searchText} />
			</Paper>
		</NewsContext.Provider>
	);
}

export default withReducer('searchApp', reducer)(NewsRelation);
