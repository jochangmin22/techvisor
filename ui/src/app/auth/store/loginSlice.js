import { createSlice } from '@reduxjs/toolkit';
import jwtService from 'app/services/jwtService';
import { setUserData } from './userSlice';

export const submitEmail = ({ email }) => async dispatch => {
	return jwtService
		.signInWithEmail(email)
		.then(() => {
			return dispatch(setSignedIn(true));
		})
		.catch(() => {
			return dispatch(setSignedIn(false));
		});
};

export const submitPassword = ({ email, password }) => async dispatch => {
	return jwtService
		.signInWithEmailAndPassword(email, password)
		.then(user => {
			dispatch(setUserData(user));

			return dispatch(loginSuccess());
		})
		.catch(error => {
			return dispatch(loginError(error));
		});
};

const initialState = {
	success: false,
	signedIn: null,
	error: {
		username: null,
		password: null
	}
};

const loginSlice = createSlice({
	name: 'auth/login',
	initialState,
	reducers: {
		loginSuccess: (state, action) => {
			state.success = true;
		},
		loginError: (state, action) => {
			state.success = false;
			state.error = action.payload;
		},
		resetLogin: (state, action) => initialState,

		setSignedIn: (state, action) => {
			state.signedIn = action.payload;
		}
	},
	extraReducers: {}
});

export const { loginSuccess, loginError, resetLogin, setSignedIn } = loginSlice.actions;

export default loginSlice.reducer;
