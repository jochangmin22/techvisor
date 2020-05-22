import axios from 'axios';

export const GET_APPLICANT_TABLE = '[SEARCH APP] GET APPLICANT TABLE';
export const UPDATE_APPLICANT_TABLE = '[SEARCH APP] UPDATE APPLICANT TABLE';
export const SET_APPLICANT_TABLE_SEARCH_TEXT = '[SEARCH APP] SET APPLICANT TABLE SEARCH TEXT';
// export const UPDATE_APPLICANT_SEARCH_TEXT = "[SEARCH APP] UPDATE APPLICANT SEARCH TEXT";

export const OPEN_APPLICANT_CLICK_AWAY = '[SEARCH APP] OPEN APPLICANT CLICK AWAY';
export const CLOSE_APPLICANT_CLICK_AWAY = '[SEARCH APP] CLOSE APPLICANT CLICK AWAY';
export const UPDATE_APPLICANT = '[SEARCH APP] UPDATE APPLICANT TO SEARCHTEXT';

export const TOGGLE_IN_SELECTED_APPLICANTS = '[SEARCH APP] TOGGLE IN SELECTED APPLICANTS';
export const SELECT_ALL_APPLICANTS = '[SEARCH APP] SELECT ALL APPLICANTS';
export const DESELECT_ALL_APPLICANTS = '[SEARCH APP] DESELECT ALL APPLICANTS';

export function getApplicantTable(searchText) {
	// const request = axios.get("/api/search-app/applicant", {
	//     params: routeParams
	// });
	const request = axios({
		method: 'get',
		// headers: { "Access-Control-Allow-Origin": true },
		url: `${process.env.REACT_APP_API_URL}/api/search-app/applicant/${searchText}`
	});
	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_APPLICANT_TABLE,
				payload: response.data,
				searchText
			})
		);
}

export function setApplicantTableSearchText(event) {
	return {
		type: SET_APPLICANT_TABLE_SEARCH_TEXT,
		searchText: event.target.value
	};
}
// export function updateApplicantSearchText(searchText) {
//     return {
//         type: UPDATE_APPLICANT_SEARCH_TEXT,
//         searchText: searchText
//     };
// }

export function updateApplicant(params) {
	// const request = axios.post("/api/search-app/update-applicant", {
	//     applicant: Object.values(applicant)
	// });

	// return dispatch =>
	//     request.then(response =>
	//         dispatch({
	//             type: UPDATE_APPLICANT,
	//             payload: response.data
	//         })
	//     );
	const request = axios({
		method: 'get',
		// headers: { "Access-Control-Allow-Origin": true },
		// url: "http://192.168.0.36:9000/api/applicant/",
		url: `${process.env.REACT_APP_API_URL}/api/search-app/applicant/${params}`
		// url: "/api/search-app/applicant"
	});
	return dispatch =>
		request.then(response =>
			dispatch({
				type: UPDATE_APPLICANT_TABLE,
				payload: response.data
			})
		);
}

export function toggleApplicantClickAway(value) {
	return {
		type: value ? CLOSE_APPLICANT_CLICK_AWAY : OPEN_APPLICANT_CLICK_AWAY
	};
}

// export function openApplicantDialog() {
//     return {
//         type: APPLICANT_DIALOG_OPEN
//     };
// }

// export function closeApplicantDialog() {
//     return {
//         type: APPLICANT_DIALOG_CLOSE
//     };
// }

export function toggleInSelectedApplicants(applicantId) {
	return {
		type: TOGGLE_IN_SELECTED_APPLICANTS,
		applicantId
	};
}

export function selectAllApplicants() {
	return {
		type: SELECT_ALL_APPLICANTS
	};
}

export function deSelectAllApplicants() {
	return {
		type: DESELECT_ALL_APPLICANTS
	};
}
