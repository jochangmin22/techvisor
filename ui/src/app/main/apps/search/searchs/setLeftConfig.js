// export const dateTypeOptions = [
//     { value: "우선일", label: "우선일" },
//     { value: "출원일", label: "출원일" },
//     { value: "공개일", label: "공개일" }
// ];
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
// { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
// { value: 'purple', label: 'Purple', color: '#5243AA' },
// { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
// { value: 'orange', label: 'Orange', color: '#FF8B00' },
// { value: 'yellow', label: 'Yellow', color: '#FFC400' },
// { value: 'green', label: 'Green', color: '#36B37E' },
// { value: 'forest', label: 'Forest', color: '#00875A' },
// { value: 'slate', label: 'Slate', color: '#253858' },
// { value: 'silver', label: 'Silver', color: '#666666' },
