import React from 'react';
// import { Redirect } from "react-router-dom";

const SummaryAppConfig = {
	settings: {
		layout: {
			config: { mode: 'fullwidth' }
		}
	},
	routes: [
		{
			path: '/apps/summary/:id',
			component: React.lazy(() => import('./SummaryApp'))
		},
		{
			path: '/apps/summary',
			component: React.lazy(() => import('./SummaryApp'))
			// component: () => <Redirect to="/apps/summary" />
		}
	]
};
export default SummaryAppConfig;
