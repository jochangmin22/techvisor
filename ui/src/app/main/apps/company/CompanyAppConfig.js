import React from 'react';

const CompanyAppConfig = {
	// settings: {
	//     layout: {
	//         config: {}
	//     }
	// },
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
			// component: () => <Redirect to="/apps/companies" />
			// component: CompanyApp
		},
		{
			// path: "/apps/company/:patId/:productHandle?",
			path: '/apps/company/:companyId',
			component: React.lazy(() => import('./search/SearchDetails'))
		}
	]
};
export default CompanyAppConfig;
/**
 * Lazy load Search
 */
/*
import React from 'react';

export const SearchConfig = {
    settings: {
        layout: {
            config: {}
        }
    },
    routes  : [
        {
            path     : '/company',
            component: React.lazy(() => import('./Search'))
        }
    ]
};
*/
