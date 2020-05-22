import React from 'react';
// import { Redirect } from "react-router-dom";

// import SearchApp from "./SearchApp";

const SearchAppConfig = {
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
			path: '/apps/searchs',
			component: React.lazy(() => import('./SearchApp'))
			// component: () => <Redirect to="/apps/searchs" />
			// component: SearchApp
		},
		{
			// path: "/apps/search/:patId/:productHandle?",
			path: '/apps/search/:appNo',
			component: React.lazy(() => import('./search/SearchDetails'))
		}
	]
};
export default SearchAppConfig;
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
            path     : '/search',
            component: React.lazy(() => import('./Search'))
        }
    ]
};
*/
