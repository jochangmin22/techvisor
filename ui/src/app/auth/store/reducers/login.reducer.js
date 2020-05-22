import * as Actions from '../actions';

const initialState = {
	success: false,
	signedIn: null,
	error: {
		// username: null,
		password: null
	}
};

const login = (state = initialState, action) => {
	switch (action.type) {
		case Actions.LOGIN_SUCCESS: {
			return {
				...initialState,
				success: true
			};
		}
		case Actions.LOGIN_ERROR: {
			return {
				success: false,
				error: action.payload
			};
		}
		case Actions.ACCOUNT_ALREADY_EXISTS: {
			return {
				...state,
				signedIn: true
			};
		}
		case Actions.SEND_CONFIRM_MAIL: {
			return {
				...state,
				signedIn: false
			};
		}
		default: {
			return state;
		}
	}
};

export default login;
