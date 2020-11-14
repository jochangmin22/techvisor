import React from 'react';

const HomePageConfig = {
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
					display: false,
					style: 'static',
					position: 'below'
				}
			}
		},
		theme: {
			main: 'transparentDark'
			// navbar: 'transparentDark',
			// toolbar: 'transparentDark'
		}
	},
	routes: [
		{
			path: '/home',
			component: React.lazy(() => import('./HomePage'))
		}
	]
};

export default HomePageConfig;
