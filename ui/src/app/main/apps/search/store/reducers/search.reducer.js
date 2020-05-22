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

const searchReducer = function(state = initialState, action) {
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
		case Actions.GET_SEARCH_QUOTE: {
			return {
				...state,
				quote: action.payload
			};
		}
		case Actions.GET_SEARCH_FAMILY: {
			return {
				...state,
				family: action.payload
			};
		}
		case Actions.GET_SEARCH_LEGAL: {
			return {
				...state,
				legal: action.payload
			};
		}
		case Actions.GET_SEARCH_REGISTER_FEE: {
			return {
				...state,
				registerFee: action.payload
			};
		}
		case Actions.GET_SEARCH_RIGHTFULL_ORDER: {
			return {
				...state,
				rightfullOrder: action.payload
			};
		}
		case Actions.GET_SEARCH_RIGHT_HOLDER: {
			return {
				...state,
				rightHolder: action.payload
			};
		}
		case Actions.GET_SEARCH_APPLICANT: {
			return {
				...state,
				applicant: action.payload
			};
		}
		case Actions.GET_SEARCH_APPLICANT_TREND: {
			return {
				...state,
				applicantTrend: action.payload
			};
		}
		default:
			return state;
	}
};

export default searchReducer;
