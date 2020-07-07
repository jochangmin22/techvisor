import axios from 'axios';
import { setClickedSearchId } from './searchs.actions';
export const GET_SEARCH = '[SEARCH APP] GET SEARCH';
export const RESET_SEARCH = '[SEARCH APP] RESET SEARCH';
export const GET_SEARCH_QUOTE = '[SEARCH APP] GET SEARCH QUOTE';
export const GET_SEARCH_FAMILY = '[SEARCH APP] GET SEARCH FAMILY';
export const GET_SEARCH_IPC_CPC = '[SEARCH APP] GET SEARCH IPC CPC';
export const GET_SEARCH_RND = '[SEARCH APP] GET SEARCH RND';
export const GET_SEARCH_LEGAL = '[SEARCH APP] GET SEARCH LEGAL';
export const GET_SEARCH_REGISTER_FEE = '[SEARCH APP] GET SEARCH REGISTER FEE';
export const GET_SEARCH_RIGHTFULL_ORDER = '[SEARCH APP] GET SEARCH RIGHTFULL ORDER';
export const GET_SEARCH_RIGHT_HOLDER = '[SEARCH APP] GET SEARCH RIGHT HOLDER';
export const GET_SEARCH_APPLICANT = '[SEARCH APP] GET SEARCH APPLICANT';
export const GET_SEARCH_APPLICANT_TREND = '[SEARCH APP] GET SEARCH APPLICANT_TREND';
export const GET_SIMILAR = '[SEARCH APP] GET SIMILAR';
export const RESET_SIMILAR = '[SEARCH APP] RESET SIMILAR';
export const UPDATE_SIMILAR_MODEL_TYPE = '[SEARCH APP] UPDATE SIMILAR MODEL TYPE';

export function getSearch(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search`, { params });

	return dispatch =>
		request.then(response => {
			dispatch(setClickedSearchId(params.appNo));
			dispatch({
				type: GET_SEARCH,
				payload: response.data
				// routeParams
			});
		});
}

export function resetSearch() {
	return {
		type: RESET_SEARCH
	};
}

export function getQuote(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/quote`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_QUOTE,
				payload: response.data
			});
		});
}

export function getFamily(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/family`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_FAMILY,
				payload: response.data
			});
		});
}

export function getIpcCpc(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/ipc-cpc`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_IPC_CPC,
				payload: response.data
			});
		});
}

export function getRnd(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/rnd`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({ type: GET_SEARCH_RND, payload: response.data });
		});
}

export function getLegal(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/legal`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_LEGAL,
				payload: response.data
			});
		});
}

export function getRegisterFee(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/registerfee`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_REGISTER_FEE,
				payload: response.data
			});
		});
}

export function getRightfullOrder(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/rightfullorder`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_RIGHTFULL_ORDER,
				payload: response.data
			});
		});
}

export function getRightHolder(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/rightholder`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_RIGHT_HOLDER,
				payload: response.data
			});
		});
}

export function getApplicant(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/applicant`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_APPLICANT,
				payload: response.data
			});
		});
}

export function getApplicantTrend(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/applicant-trend`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_APPLICANT_TREND,
				payload: response.data
			});
		});
}

export function getSimilar(params) {
	const request = axios.get(`${process.env.REACT_APP_API_URL}/api/search-app/search/similar`, { params });

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SIMILAR,
				payload: response.data
			});
		});
}

export function resetSimilar() {
	return {
		type: RESET_SIMILAR
	};
}

export function updateSimilarModelType(data) {
	return {
		type: UPDATE_SIMILAR_MODEL_TYPE,
		payload: data
	};
}
