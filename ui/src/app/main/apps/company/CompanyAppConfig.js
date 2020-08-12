import React from 'react';

const CompanyAppConfig = {
	settings: {
		layout: {
			config: {
				mode: 'fullwidth'
			}
		}
	},
	routes: [
		{
			path: '/apps/companies',
			component: React.lazy(() => import('./CompanyApp'))
		},
		{
			path: '/apps/company/:companyId',
			component: React.lazy(() => import('./search/SearchDetails'))
		}
	]
};
export default CompanyAppConfig;
