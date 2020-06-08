import * as Actions from '../actions';

const initialState = {
	search: null,
	stock: null,
	companyCode: []
};

const searchReducer = function (state = initialState, action) {
	switch (action.type) {
		case Actions.GET_SEARCH: {
			return {
				// ...state,
				...state,
				// data: action.payload
				search: action.payload
			};
		}
		case Actions.RESET_SEARCH: {
			return null;
		}
		case Actions.GET_STOCK: {
			return {
				...state,
				stock: action.payload
			};
		}
		// case Actions.CLEAR_STOCK: {
		// 	return {
		// 		...state,
		// 		stock: '',
		// 	};
		// }
		case Actions.SET_COMPANY_CODE: {
			return {
				...state,
				companyCode: action.payload
			};
		}
		default:
			return state;
	}
};

export default searchReducer;
