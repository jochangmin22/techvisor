import React from 'react';

const AbroadAppConfig = {
	settings: {
		layout: {
			config: {
				mode: 'fullwidth'
			}
		}
	},
	routes: [
		{
			path: '/apps/abroads',
			component: React.lazy(() => import('./AbroadApp'))
		},
		{
			path: '/apps/abroad/:appNo',
			component: React.lazy(() => import('./search/SearchDetails'))
		}
	]
};
export default AbroadAppConfig;
