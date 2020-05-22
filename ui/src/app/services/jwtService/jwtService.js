import FuseUtils from '@fuse/utils/FuseUtils';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
/* eslint-disable camelcase */

class JwtService extends FuseUtils.EventEmitter {
	init() {
		this.setInterceptors();
		this.handleAuthentication();
	}

	setInterceptors = () => {
		axios.interceptors.response.use(
			response => {
				return response;
			},
			err => {
				return new Promise((resolve, reject) => {
					if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
						// if you ever get an unauthorized response, logout the user
						this.emit('onAutoLogout', 'Invalid access_token');
						this.setSession(null);
					}
					throw err;
				});
			}
		);
	};

	handleAuthentication = () => {
		const access_token = this.getAccessToken();

		if (!access_token) {
			this.emit('onNoAccessToken');

			return;
		}

		if (this.isAuthTokenValid(access_token)) {
			this.setSession(access_token);
			this.emit('onAutoLogin', true);
		} else {
			this.setSession(null);
			this.emit('onAutoLogout', 'access_token expired');
		}
	};

	createUser = data => {
		return new Promise((resolve, reject) => {
			axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, data).then(response => {
				if (response.data.user) {
					this.setSession(response.data.access_token);
					resolve(response.data.user);
				} else {
					reject(response.data.error);
				}
			});
		});
	};

	signInWithEmailAndPassword = (email, password) => {
		return new Promise((resolve, reject) => {
			axios
				.post(`${process.env.REACT_APP_API_URL}/api/auth`, {
					data: {
						email,
						password
					}
				})
				.then(response => {
					if (response.data.user) {
						this.setSession(response.data.access_token);
						resolve(response.data.user);
					} else {
						reject(response.data.error);
					}
				});
		});
	};

	signInWithEmail = email => {
		return new Promise((resolve, reject) => {
			axios
				.post(`${process.env.REACT_APP_API_URL}/api/auth_start`, {
					data: {
						email
					}
				})
				.then(response => {
					if (response.data.signed) {
						resolve(response.data.signed);
					} else {
						reject(response.data.signed);
					}
				});
		});
	};

	signInWithToken = () => {
		return new Promise((resolve, reject) => {
			axios
				.post(`${process.env.REACT_APP_API_URL}/api/auth/access-token`, {
					data: {
						access_token: this.getAccessToken()
					}
				})
				.then(response => {
					if (response.data.user) {
						this.setSession(response.data.access_token);
						resolve(response.data.user);
					} else {
						this.logout();
						Promise.reject(new Error('Failed to login with token.'));
					}
				})
				.catch(error => {
					this.logout();
					Promise.reject(new Error('Failed to login with token.'));
				});
		});
	};

	updateUserData = user => {
		return axios.post(`${process.env.REACT_APP_API_URL}/api/auth/user/update`, {
			user
		});
	};

	setSession = access_token => {
		if (access_token) {
			localStorage.setItem('jwt_access_token', access_token);
			axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
		} else {
			localStorage.removeItem('jwt_access_token');
			delete axios.defaults.headers.common.Authorization;
		}
	};

	logout = () => {
		this.setSession(null);
	};

	isAuthTokenValid = access_token => {
		if (!access_token) {
			return false;
		}
		const decoded = jwtDecode(access_token);
		const currentTime = Date.now() / 1000;
		if (decoded.exp < currentTime) {
			console.warn('access token expired');
			return false;
		}

		return true;
	};

	getAccessToken = () => {
		return window.localStorage.getItem('jwt_access_token');
	};
	// 404 : 코드없음 -> null
	// 403 : 코드사용 -> name
	// 410 : 코드만료 -> error
	// 200 : 사용자 없음 -> email, register_token
	// 200 : 사용자 있음 인증메일 -> email_auth ㅣlogged 갱신 -> user, profile, token
	getToken = code => {
		return new Promise((resolve, reject) => {
			axios
				.get(`${process.env.REACT_APP_API_URL}/api/auth/verify/${code}`)
				.then(response => {
					console.log('response', response.data);
					// 200 : {email, register_token} or 201: { user:,profile:,token }
					// if (response.status === 200) {
					// 	resolve(response.data);
					// }
					resolve(response.data);
				})
				.catch(error => {
					console.log('error', error.response.code);
					reject(error);
					// Promise.reject(new Error('Not Found'));
					// console.log('error', 'fdf');
					// if (response.status === 404) {
					// 	reject(response.status);
					// } else if (response.status === 403) {
					// 	reject(response.name);
					// } else if (response.status === 410) {
					// 	reject(response.error);
					// } else {
					// 	reject(response.error);
					// }
				});
		});
	};
}

const instance = new JwtService();

export default instance;
