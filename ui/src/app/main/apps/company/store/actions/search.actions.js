import axios from 'axios';
import { setClickedSearchId } from './searchs.actions';
export const GET_SEARCH = '[COMPANY APP] GET SEARCH';
export const RESET_SEARCH = '[COMPANY APP] RESET SEARCH';
export const GET_SEARCH_QUOTE = '[COMPANY APP] GET SEARCH QUOTE';
export const GET_SEARCH_FAMILY = '[COMPANY APP] GET SEARCH FAMILY';
export const GET_SEARCH_LEGAL = '[COMPANY APP] GET SEARCH LEGAL';
export const GET_SEARCH_REGISTER_FEE = '[COMPANY APP] GET SEARCH REGISTER FEE';
export const GET_SEARCH_RIGHTFULL_ORDER = '[COMPANY APP] GET SEARCH RIGHTFULL ORDER';
export const GET_SEARCH_RIGHT_HOLDER = '[COMPANY APP] GET SEARCH RIGHT HOLDER';
export const GET_SEARCH_APPLICANT = '[COMPANY APP] GET SEARCH APPLICANT';
export const GET_SEARCH_APPLICANT_TREND = '[COMPANY APP] GET SEARCH APPLICANT_TREND';

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
				// routeParams
			});
		});
}

export function resetSearch() {
	return {
		type: RESET_SEARCH
	};
}
