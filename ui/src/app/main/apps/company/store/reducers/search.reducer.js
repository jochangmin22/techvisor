import * as Actions from '../actions';

const initialState = {
	search: null,
	stock: null,
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
		default:
			return state;
	}
};

export default searchReducer;
