import * as Actions from '../actions';

const initialState = {
	search: null,
	quote: null,
	family: null,
	legal: null,
	registerFee: null,
	rightfullOrder: null,
	rightHolder: null,
	applicant: null,
	applicantTrend: null
};

// const initialState = null;

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
		default:
			return state;
	}
};

export default searchReducer;
