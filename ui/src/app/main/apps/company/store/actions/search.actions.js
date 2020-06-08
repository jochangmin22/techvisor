import axios from 'axios';
import { setClickedSearchId } from './searchs.actions';
export const GET_SEARCH = '[COMPANY APP] GET SEARCH';
export const RESET_SEARCH = '[COMPANY APP] RESET SEARCH';
export const GET_STOCK = '[COMPANY APP] GET STOCK';
export const CLEAR_STOCK = '[COMPANY APP] CLEAR STOCK';
export const SET_COMPANY_CODE = '[COMPANY APP] SET COMPANY CODE';

export function getSearch(params) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/company-app/search/${params}`
	});

	return dispatch =>
		request.then(response => {
			dispatch(setClickedSearchId(params));
			dispatch({
				type: GET_SEARCH,
				payload: response.data
			});
		});
}

export function resetSearch() {
	return {
		type: RESET_SEARCH
	};
}

export function getStock(params) {
	const request = axios.post(`${process.env.REACT_APP_API_URL}/api/company-app/stock`, params);

	return dispatch =>
		request.then(response => {
			// dispatch(resetSearch());
			dispatch({
				type: GET_STOCK,
				payload: response.data
			});
		});
}

export function clearStock() {
	return {
		type: CLEAR_STOCK
	};
}

export function setCompanyCode(data) {
	return {
		type: SET_COMPANY_CODE,
		payload: data
	};
}
