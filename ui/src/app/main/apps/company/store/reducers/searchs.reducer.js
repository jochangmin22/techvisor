import * as Actions from '../actions';
// import _ from "@lodash";

const initialState = {
	entities: [],
	searchParams: {
		searchText: '',
		searchNum: '',
		companyName: '',
		companyAddress: '',
		bizDomain: '',
		relatedKeyword: '',
		customCriteria: '',
		industry: '',
		marketCapStart: '',
		marketCapStartEnd: '',
		foundedStart: '',
		foundedEnd: '',
		employeeStart: '',
		employeeEnd: '',
		repAgeStart: '',
		repAgeEnd: ''
	},
	searchScope: {
		volume: '',
		limit: 100,
		offset: 0
	},
	matrixCategory: '연도별', // ['주변단어', '국가별', '연도별', '기술별', '기업별']
	searchLoading: null,
	searchSubmit: null,
	cols: ['1', '2', '3', '4', '5', '6', '7', '8'],
	clickedSearchId: null,
	selectedSearchIds: [],
	topicChips: [],
	news: [],
	matrix: [],
	wordCloud: [],
	keywords: [],
	selectedIndex: null
};

const searchsReducer = function (state = initialState, action) {
	switch (action.type) {
		case Actions.GET_SEARCHS: {
			return {
				...state,
				entities: action.payload
			};
		}
		case Actions.SET_MOCK_DATA: {
			return {
				...state,
				entities: action.entities,
				searchParams: action.searchParams,
				matrix: action.matrix,
				wordCloud: action.wordCloud,
				keywords: action.keywords
			};
		}
		case Actions.CLEAR_SEARCHS: {
			return {
				...state,
				entities: [],
				wordCloud: [],
				keywords: []
			};
		}
		case Actions.CLEAR_SEARCH_TEXT: {
			return {
				...initialState
			};
		}
		case Actions.SET_SEARCH_LOADING: {
			return {
				...state,
				searchLoading: action.searchLoading
			};
		}
		case Actions.UPDATE_COLS: {
			return {
				...state,
				cols: action.cols
			};
		}
		case Actions.GET_TOPIC_CHIPS: {
			return {
				...state,
				topicChips: action.payload
			};
		}
		case Actions.SET_CLICKED_SEARCH_ID: {
			return {
				...state,
				clickedSearchId: action.payload
			};
		}
		case Actions.SET_SEARCH_PARAMS: {
			return {
				...state,
				searchParams: action.searchParams
			};
		}
		case Actions.SET_SEARCH_NUM: {
			return {
				...state,
				searchParams: {
					...initialState.searchParams,
					searchNum: action.searchNum
				}
			};
		}
		case Actions.SET_SEARCH_VOLUME: {
			return {
				...state,
				searchVolume: action.searchVolume
			};
		}
		case Actions.SET_SEARCH_SUBMIT: {
			return {
				...state,
				searchSubmit: action.searchSubmit
			};
		}
		case Actions.GET_NEWS: {
			return {
				...state,
				news: action.payload
			};
		}
		case Actions.GET_MATRIX: {
			return {
				...state,
				matrix: action.payload
			};
		}
		case Actions.UPDATE_MATRIX_CATEGORY: {
			return {
				...state,
				matrix: action.payload
			};
		}
		case Actions.GET_WORDCLOUD: {
			return {
				...state,
				wordCloud: action.payload
			};
		}
		case Actions.GET_SUBJECT_RELATION: {
			return {
				...state,
				keywords: action.payload
			};
		}
		case Actions.RESET_SUBJECT_RELATION_VEC: {
			return {
				...state,
				keywords: {
					topic: action.topic // only vec reset
				}
			};
		}
		case Actions.UPDATE_SUBJECT_RELATION: {
			return {
				...state,
				keywords: {
					...state.keywords,
					vec: action.payload
				}
			};
		}
		case Actions.SET_SELECTED_INDEX: {
			return {
				...state,
				selectedIndex: action.selectedIndex
			};
		}
		default:
			return state;
	}
};

export default searchsReducer;
