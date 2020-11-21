import { createSlice } from '@reduxjs/toolkit';
import jwtService from 'app/services/jwtService';
import { setUserData } from './userSlice';

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
		setRegisterToken: (state, action) => {
			state.registerToken = action.payload;
		}
	},
	extraReducers: {}
});

export const { registerSuccess, registerError, resetRegister, setRegisterToken } = registerSlice.actions;

export default registerSlice.reducer;
