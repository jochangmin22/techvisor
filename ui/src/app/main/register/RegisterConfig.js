import { authRoles } from 'app/auth';
import Register from './Register';
import React from 'react';

const RegisterConfig = {
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
			path: '/register/:code',
			component: React.lazy(() => import('./Register'))
		},
		{
			path: '/register',
			component: Register
		}
	]
};

export default RegisterConfig;
