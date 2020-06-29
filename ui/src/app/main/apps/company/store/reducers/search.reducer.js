import * as Actions from '../actions';

const initialState = {
	search: null,
	stock: {
		entities: [],
		chartType: 'year'
	},
	companyInfo: []
};

const searchReducer = function (state = initialState, action) {
	switch (action.type) {
		case Actions.GET_SEARCH: {
			return {
				...state,
				search: action.payload
			};
		}
		case Actions.RESET_SEARCH: {
			return {
				...initialState
			};
		}
		case Actions.GET_STOCK: {
			return {
				...state,
				stock: {
					...state.stock,
					entities: action.payload
				}
			};
		}
		// case Actions.CLEAR_STOCK: {
		// 	return {
		// 		...state,
		// 		stock: '',
		// 	};
		// }
		case Actions.SET_CHART_TYPE: {
			return {
				...state,
				stock: {
					...state.stock,
					chartType: action.payload
				}
			};
		}
		case Actions.GET_COMPANY_INFO: {
			return {
				...state,
				companyInfo: action.payload
			};
		}
		default:
			return state;
	}
};

export default searchReducer;
