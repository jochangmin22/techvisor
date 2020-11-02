import React from 'react';

const SearchAppConfig = {
	settings: {
		layout: {
			config: {
				mode: 'fullwidth'
			}
		}
	},
	routes: [
		{
			path: '/apps/searchs',
			component: React.lazy(() => import('./SearchApp'))
		},
		{
			path: '/apps/search/:appNo',
			component: React.lazy(() => import('./search/SearchDetails'))
		},
		{
			path: '/apps/searchPage/:appNo',
			component: React.lazy(() => import('./search/SearchPageLayout'))
		}
	]
};
export default SearchAppConfig;
