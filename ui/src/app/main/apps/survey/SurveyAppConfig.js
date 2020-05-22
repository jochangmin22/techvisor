import SurveyApp from './SurveyApp';

const SurveyAppConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/survey',
			component: SurveyApp
		}
	]
};
export default SurveyAppConfig;
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
