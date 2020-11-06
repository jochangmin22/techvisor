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
			path: '/service',
			component: React.lazy(() => import('./ServicePage'))
		}
	]
};

export default PolicyPageConfig;
