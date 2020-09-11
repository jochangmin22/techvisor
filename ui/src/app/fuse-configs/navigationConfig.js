import i18next from 'i18next';
import ko from './navigation-i18n/ko';
// import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
// import tr from './navigation-i18n/tr';
i18next.addResourceBundle('ko', 'navigation', ko);
i18next.addResourceBundle('en', 'navigation', en);
// i18next.addResourceBundle('tr', 'navigation', tr);
// i18next.addResourceBundle('ar', 'navigation', ar);

const navigationConfig = [
	{
		id: 'search',
		title: '기본검색',
		translate: 'SEARCH',
		type: 'item',
		icon: 'search',
		url: '/apps/searchs'
	},
	{
		id: 'company',
		title: '기업검색',
		translate: 'COMPANY',
		type: 'item',
		icon: 'domain',
		url: '/apps/companies'
	}
	// {
	// 	id: 'applications',
	// 	title: 'Applications',
	// 	translate: 'APPLICATIONS',
	// 	type: 'group',
	// 	icon: 'apps',
	// 	children: [
	// 		{
	// 			id: 'example-component',
	// 			title: 'Example',
	// 			translate: 'EXAMPLE',
	// 			type: 'item',
	// 			icon: 'whatshot',
	// 			url: '/example'
	// 		}
	// 	]
	// }

	// {
	// 	id: 'pat_classify',
	// 	title: '특허분류',
	// 	translate: 'PAT_CLASSIFY',
	// 	type: 'item',
	// 	icon: 'import_contacts',
	// 	url: '/apps/classify'
	// },
	// {
	// 	id: 'auto_report',
	// 	title: '자동보고서',
	// 	translate: 'AUTO_REPORT',
	// 	type: 'group',
	// 	icon: 'apps',
	// 	children: [
	// 		{
	// 			id: 'prior-art-research',
	// 			title: '선행기술조사',
	// 			translate: 'PRIOR_ART_RESEARCH',
	// 			type: 'item',
	// 			icon: 'history',
	// 			url: '/apps/research'
	// 		},
	// 		{
	// 			id: 'patent-summary-map',
	// 			title: '특허요지맵',
	// 			translate: 'PATENT_SUMMARY_MAP',
	// 			type: 'item',
	// 			icon: 'receipt',
	// 			url: '/apps/summary'
	// 		},
	// 		{
	// 			id: 'trend-analysis',
	// 			title: '동향분석',
	// 			translate: 'TREND_ANALYSIS',
	// 			type: 'item',
	// 			icon: 'search',
	// 			url: '/apps/trend'
	// 		}
	// 	]
	// }
];

export default navigationConfig;
