import axios from 'axios';
// import {showMessage} from 'app/store/actions/fuse';

export const GET_WORDCLOUD = '[COMPANY APP] GET WORDCLOUD';
export const GET_SUBJECT_RELATION = '[COMPANY APP] GET SUBJECT RELATION';
export const CLEAR_WIDGETS_DATA = '[COMPANY APP] CLEAR WIDGETS DATA';
export const UPDATE_SUBJECT_RELATION = '[COMPANY APP] UPDATE SUBJECT RELATION';
export const RESET_SUBJECT_RELATION_VEC = '[COMPANY APP] RESET SUBJECT RELATION VEC';
export const SAVE_VISUALTAB = '[COMPANY APP] SAVE VISUALTAB';
export const SET_SELECTED_INDEX = '[COMPANY APP] SET SELECTED INDEX';

export function getWordCloud(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/companies/wordcloud`,
		{
			params
		},
		{ timeout: 1000 * 60 * 1 } // 1 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_WORDCLOUD,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function getKeywords(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/companies/vec`,
		{
			params
		},
		{ timeout: 1000 * 60 * 1 } // 1 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_SUBJECT_RELATION,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function clearWidgetsData() {
	return {
		type: CLEAR_WIDGETS_DATA
	};
}

export function resetKeywordsVec(data) {
	return {
		type: RESET_SUBJECT_RELATION_VEC,
		topic: data
	};
}

export function updateKeywords(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/companies/vec`,
		{
			params
		},
		{ timeout: 1000 * 60 * 1 } // 1 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: UPDATE_SUBJECT_RELATION,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function setSelectedIndex(data) {
	return {
		type: SET_SELECTED_INDEX,
		selectedIndex: data.selectedIndex
	};
}

export function saveVitualTab(data) {
	const request = axios.post('/api/academy-app/course/save', data);

	return dispatch =>
		request.then(response => {
			// dispatch(showMessage({ message: "Course Saved" }));

			return dispatch({
				type: SAVE_VISUALTAB,
				payload: response.data
			});
		});
}
