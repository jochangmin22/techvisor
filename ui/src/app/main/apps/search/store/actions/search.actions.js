import axios from 'axios';
import { setClickedSearchId } from './searchs.actions';
export const GET_SEARCH = '[SEARCH APP] GET SEARCH';
export const RESET_SEARCH = '[SEARCH APP] RESET SEARCH';
export const GET_SEARCH_QUOTE = '[SEARCH APP] GET SEARCH QUOTE';
export const GET_SEARCH_FAMILY = '[SEARCH APP] GET SEARCH FAMILY';
export const GET_SEARCH_LEGAL = '[SEARCH APP] GET SEARCH LEGAL';
export const GET_SEARCH_REGISTER_FEE = '[SEARCH APP] GET SEARCH REGISTER FEE';
export const GET_SEARCH_RIGHTFULL_ORDER = '[SEARCH APP] GET SEARCH RIGHTFULL ORDER';
export const GET_SEARCH_RIGHT_HOLDER = '[SEARCH APP] GET SEARCH RIGHT HOLDER';
export const GET_SEARCH_APPLICANT = '[SEARCH APP] GET SEARCH APPLICANT';
export const GET_SEARCH_APPLICANT_TREND = '[SEARCH APP] GET SEARCH APPLICANT_TREND';

export function getSearch(appNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search/${appNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch(setClickedSearchId(appNo));
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

export function getQuote(appNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-quote/${appNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_QUOTE,
				payload: response.data
			});
		});
}

export function getFamily(appNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-family/${appNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_FAMILY,
				payload: response.data
			});
		});
}

export function getLegal(appNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-legal/${appNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_LEGAL,
				payload: response.data
			});
		});
}

export function getRegisterFee(rgNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-registerfee/${rgNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_REGISTER_FEE,
				payload: response.data
			});
		});
}

export function getRightfullOrder(appNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-rightfullorder/${appNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_RIGHTFULL_ORDER,
				payload: response.data
			});
		});
}

export function getRightHolder(rgNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-rightholder/${rgNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_RIGHT_HOLDER,
				payload: response.data
			});
		});
}

export function getApplicant(cusNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-applicant/${cusNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_APPLICANT,
				payload: response.data
			});
		});
}

export function getApplicantTrend(cusNo) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/search-applicant-trend/${cusNo}`
	});

	return dispatch =>
		request.then(response => {
			dispatch({
				type: GET_SEARCH_APPLICANT_TREND,
				payload: response.data
			});
		});
}
