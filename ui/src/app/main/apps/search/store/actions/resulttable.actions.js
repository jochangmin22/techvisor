import axios from 'axios';

export const GET_RESULTS_TABLE = '[SEARCH APP] GET RESULTS TABLE';
export const SET_RESULTS_TABLE_SEARCH_TEXT = '[SEARCH APP] SET RESULTS TABLE SEARCH TEXT';

export function getResultsTable(searchText) {
	// const request = axios.get("/api/search-app/results");

	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/search-app/applicant/${searchText}`
	});

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_RESULTS_TABLE,
				payload: response.data,
				searchText
			})
		);
}

export function setResultsTableSearchText(event) {
	return {
		type: SET_RESULTS_TABLE_SEARCH_TEXT,
		searchText: event.target.value
	};
}
