import firebaseService from 'app/services/firebaseService';
import jwtService from 'app/services/jwtService';
import * as Actions from 'app/store/actions';
import * as UserActions from './user.actions';

export const REGISTER_ERROR = 'REGISTER_ERROR';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const GET_TOKEN = 'GET TOKEN';

export function submitRegister({ displayName, password, email }) {
	return dispatch =>
		jwtService
			.createUser({
				displayName,
				password,
				email
			})
			.then(user => {
				dispatch(UserActions.setUserData(user));
				return dispatch({
					type: REGISTER_SUCCESS
				});
			})
			.catch(error => {
				return dispatch({
					type: REGISTER_ERROR,
					payload: error
				});
			});
}

export function registerWithFirebase(model) {
	if (!firebaseService.auth) {
		console.warn("Firebase Service didn't initialize, check your configuration");

		return () => false;
	}

	const { email, password, displayName } = model;
	return dispatch =>
		firebaseService.auth
			.createUserWithEmailAndPassword(email, password)
			.then(response => {
				dispatch(
					UserActions.createUserSettingsFirebase({
						...response.user,
						displayName,
						email
					})
				);

				return dispatch({
					type: REGISTER_SUCCESS
				});
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
					dispatch(Actions.showMessage({ message: error.message }));
				}

				return dispatch({
					type: REGISTER_ERROR,
					payload: response
				});
			});
}

export function submitRegisterWithCode(code) {
	return dispatch =>
		jwtService
			.getToken(code)
			.then(response => {
				console.log('submitRegisterWithCode -> response', response);
				// 200 : no user in db {email, register_token} or user in db 201: { user:,profile:,token }
				// dispatch(UserActions.setUserData(user));
				return dispatch({
					type: GET_TOKEN,
					payload: response
				});
			})
			.catch(error => {
				console.log('submitRegisterWithCode -> error', error);
				// return dispatch({
				// 	type: REGISTER_ERROR,
				// 	payload: error
				// });
			});
}
