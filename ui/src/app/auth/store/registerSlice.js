import { createSlice } from '@reduxjs/toolkit';
import jwtService from 'app/services/jwtService';
import { setUserData } from './userSlice';

export const verifyCode = code => async dispatch => {
	return jwtService
		.verifyEmailCode(code)
		.then(() => {
			return dispatch(verifySuccess());
		})
		.catch(error => {
			return dispatch(verifyError(error));
		});
};

export const submitRegister = params => async dispatch => {
	return jwtService
		.createUser(params)
		.then(user => {
			dispatch(setUserData(user));
			return dispatch(registerSuccess());
		})
		.catch(error => {
			return dispatch(registerError(error));
		});
};

export const getRegisterToken = code => async dispatch => {
	return jwtService
		.getToken(code)
		.then(response => {
			return dispatch(setRegisterToken(response.register_token));
		})
		.catch(error => {
			return dispatch(registerError(error));
		});
};

const initialState = {
	success: false,
	verify: null,
	error: {
		email: null,
		displayName: null,
		code: null,
		password: null
	},
	registerToken: ''
};

const registerSlice = createSlice({
	name: 'auth/register',
	initialState,
	reducers: {
		registerSuccess: (state, action) => {
			state.success = true;
		},
		registerError: (state, action) => {
			state.success = false;
			state.error = action.payload;
		},
		resetRegister: (state, action) => initialState,
		verifySuccess: (state, action) => {
			state.verify = true;
		},
		verifyError: (state, action) => {
			state.verify = false;
			state.error.code = action.payload;
		},
		resetVerify: (state, action) => initialState,
		setRegisterToken: (state, action) => {
			state.registerToken = action.payload;
		}
	},
	extraReducers: {}
});

export const {
	registerSuccess,
	registerError,
	resetRegister,
	verifySuccess,
	verifyError,
	resetVerify,
	setRegisterToken
} = registerSlice.actions;

export default registerSlice.reducer;
