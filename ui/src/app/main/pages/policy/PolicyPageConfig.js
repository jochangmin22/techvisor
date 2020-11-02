import React from 'react';

const PolicyPageConfig = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				}
			}
		},
		theme: {
			main: 'light8'
		}
	},
	routes: [
		{
			path: '/policy/:mode(privacy|terms)?',
			component: React.lazy(() => import('./Policy'))
		}
	]
};

export default PolicyPageConfig;
