import * as Actions from '../actions';
// import _ from "@lodash";

const initialState = {
	entities: [],
	searchParams: {
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
	},
	searchScope: {
		searchVolume: '',
		wordCloudScope: {
			volume: '요약',
			unit: '구문', // '워드',
			output: 50
		}
	},
	searchLoading: null,
	searchSubmit: null,
	cols: ['1', '2', '3', '4', '5', '6', '7', '8'],
	clickedSearchId: null,
	selectedSearchIds: [],
	topicChips: [],
	news: [],
	newsSA: null,
	indicator: [],
	relatedCompany: [],
	matrix: {
		entities: [],
		category: '연도별', // ['국가별', '연도별', '기술별', '기업별'],
		max: 0
	},
	matrixDialog: {
		props: {
			open: false
		},
		data: null
	},
	wordCloud: [],
	subjectRelation: {
		topic: [],
		vec: [],
		modelType: 'word2vec' // ['word2vec','fasttext']
	}
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
				subjectRelation: action.subjectRelation
			};
		}
		case Actions.CLEAR_SEARCHS: {
			return {
				...state,
				entities: [],
				wordCloud: [],
				subjectRelation: initialState.subjectRelation
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
				searchScope: {
					...state.searchScope,
					searchVolume: action.searchVolume
				}
			};
		}
		case Actions.SET_WORDCLOUD_SCOPE: {
			return {
				...state,
				searchScope: {
					...state.searchScope,
					wordCloudScope: action.wordCloudScope
				}
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
		case Actions.GET_NEWS_SA: {
			return {
				...state,
				newsSA: action.payload
			};
		}
		case Actions.GET_RELATED_COMPANY: {
			return {
				...state,
				relatedCompany: action.payload
			};
		}
		case Actions.GET_MATRIX: {
			return {
				...state,
				matrix: {
					...state.matrix,
					entities: action.payload.entities,
					max: action.payload.max
				}
			};
		}
		case Actions.GET_MATRIX_DIALOG: {
			return {
				...state,
				matrixDialog: {
					...state.matrixDialog,
					data: action.payload
				}
			};
		}
		case Actions.UPDATE_MATRIX_CATEGORY: {
			return {
				...state,
				matrix: {
					...state.matrix,
					category: action.payload
				}
			};
		}
		case Actions.OPEN_MATRIX_DIALOG: {
			return {
				...state,
				matrixDialog: {
					...state.matrixDialog,
					props: {
						open: true
					}
				}
			};
		}
		case Actions.CLOSE_MATRIX_DIALOG: {
			return {
				...state,
				matrixDialog: {
					props: {
						open: false
					},
					data: null
				}
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
				subjectRelation: action.payload
			};
		}
		case Actions.RESET_SUBJECT_RELATION_VEC: {
			return {
				...state,
				subjectRelation: {
					...state.subjectRelation,
					vec: [],
					topic: action.topic // only vec reset
				}
			};
		}
		case Actions.UPDATE_SUBJECT_RELATION: {
			return {
				...state,
				subjectRelation: {
					...state.subjectRelation,
					vec: action.payload
				}
			};
		}
		case Actions.UPDATE_SUBJECT_RELATION_MODEL_TYPE: {
			return {
				...state,
				subjectRelation: {
					...state.subjectRelation,
					modelType: action.payload
				}
			};
		}
		default:
			return state;
	}
};

export default searchsReducer;
