import React from 'react';
// import { Redirect } from "react-router-dom";

const ClassifyAppConfig = {
	settings: {
		layout: {
			config: { mode: 'fullwidth' }
		}
	},
	routes: [
		{
			path: '/apps/classify/:id',
			component: React.lazy(() => import('./ClassifyApp'))
		},
		{
			path: '/apps/classify',
			component: React.lazy(() => import('./ClassifyApp'))
			// component: () => <Redirect to="/apps/classify" />
		}
	]
};

export default ClassifyAppConfig;
