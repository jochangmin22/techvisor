import React from 'react';

const LandingPageConfig = {
	settings: {
		layout: {
			config: {
				toolbar: {
					display: false
				},
				footer: {
					display: false,
					style: 'static',
					position: 'below'
				}
			}
		},
		theme: {
			navbar: 'defaultDark'
		}
	},
	routes: [
		{
			path: '/landing',
			component: React.lazy(() => import('./LandingPage'))
		}
	]
};

export default LandingPageConfig;
