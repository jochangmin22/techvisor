import { createSlice } from '@reduxjs/toolkit';
import { showMessage } from 'app/store/fuse/messageSlice';
import firebaseService from 'app/services/firebaseService';
import jwtService from 'app/services/jwtService';
import { createUserSettingsFirebase, setUserData } from './userSlice';

export const submitRegister = ({ displayName, password, email }, code) => async dispatch => {
	return jwtService
		.createUser({
			displayName,
			password,
			email,
			code
		})
		.then(user => {
			dispatch(setUserData(user));
			return dispatch(registerSuccess());
		})
		.catch(error => {
			return dispatch(registerError(error));
		});
};

export const registerWithFirebase = model => async dispatch => {
	if (!firebaseService.auth) {
		console.warn("Firebase Service didn't initialize, check your configuration");

		return () => false;
	}
	const { email, password, displayName } = model;

	return firebaseService.auth
		.createUserWithEmailAndPassword(email, password)
		.then(response => {
			dispatch(
				createUserSettingsFirebase({
					...response.user,
					displayName,
					email
				})
			);

			return dispatch(registerSuccess());
		})
		.catch(error => {
			const usernameErrorCodes = ['auth/operation-not-allowed', 'auth/user-not-found', 'auth/user-disabled'];

			const emailErrorCodes = ['auth/email-already-in-use', 'auth/invalid-email'];

			const passwordErrorCodes = ['auth/weak-password', 'auth/wrong-password'];

			const response = {
				email: emailErrorCodes.includes(error.code) ? error.message : null,
				displayName: usernameErrorCodes.includes(error.code) ? error.message : null,
				password: passwordErrorCodes.includes(error.code) ? error.message : null
			};

			if (error.code === 'auth/invalid-api-key') {
				dispatch(showMessage({ message: error.message }));
			}

			return dispatch(registerError(response));
		});
};

export const getRegisterToken = code => async dispatch => {
	return jwtService
		.getToken(code)
		.then(response => {
			// console.log('getRegisterToken -> response', response);
			// 200 : no user in db {email, register_token} or user in db 201: { user:,profile:,token }
			// dispatch(UserActions.setUserData(user));
			return dispatch(setRegisterToken(response.register_token));
		})
		.catch(error => {
			return dispatch(registerError(error));
		});
};

const initialState = {
	success: false,
	error: {
		username: null,
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
		setRegisterToken: (state, action) => {
			state.registerToken = action.payload;
		}
	},
	extraReducers: {}
});

export const { registerSuccess, registerError, setRegisterToken } = registerSlice.actions;

export default registerSlice.reducer;
