import React from 'react';
import i18next from 'i18next';
import en from './i18n/en';
import ko from './i18n/ko';

i18next.addResourceBundle('en', 'Error404Page', en);
i18next.addResourceBundle('ko', 'Error404Page', ko);

const Error404PageConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/pages/errors/error-404',
			component: React.lazy(() => import('./Error404Page'))
		}
	]
};

export default Error404PageConfig;
