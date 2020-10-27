import React from 'react';

const LandingPageConfig = {
	settings: {
		layout: {
			config: {
				toolbar: {
					display: false
				}
			}
		},
		theme: {
			navbar: 'defaultDark'
		}
	},
	routes: [
		{
			path: '/pages/landing',
			component: React.lazy(() => import('./LandingPage'))
		}
	]
};

export default LandingPageConfig;