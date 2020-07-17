const LeftConfig = {
	options: {
		dateType: { PRD: '우선일', AD: '출원일', PD: '공개일', FD: '등록일' },
		patentOffice: ['KR', 'JR', 'US', 'EP', 'PCT', 'ETC'],
		language: ['한글', '영어'],
		status: ['출원', '등록'],
		ipType: ['특허', '실용신안']
		// litigation: ["침해있음", "침해없음"]
	},
	defaultFormValue: {
		searchText: '',
		searchNum: '',
		terms: [],
		dateType: '',
		startDate: '',
		endDate: '',
		inventor: [],
		assignee: [],
		patentOffice: [],
		language: [],
		status: [],
		ipType: []
	}
};

export default LeftConfig;
