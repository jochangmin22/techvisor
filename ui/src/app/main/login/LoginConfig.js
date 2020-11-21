import React from 'react';
import { authRoles } from 'app/auth';

const LoginConfig = {
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
				},
				leftSidePanel: {
					display: false
				},
				rightSidePanel: {
					display: false
				}
			}
		}
	},
	auth: authRoles.onlyGuest,
	routes: [
		{
			path: '/reset-password/:email',
			component: React.lazy(() => import('./reset-password/ResetPassword'))
		},
		{
			path: '/login/:email',
			component: React.lazy(() => import('./Login'))
		},
		{
			path: '/login',
			component: React.lazy(() => import('./Login'))
		}
	]
};

export default LoginConfig;
