import axios from 'axios';
// import {showMessage} from 'app/store/actions/fuse';

export const GET_WORDCLOUD = '[SEARCH APP] GET WORDCLOUD';
export const GET_SUBJECT_RELATION = '[SEARCH APP] GET SUBJECT RELATION';
export const CLEAR_WIDGETS_DATA = '[SEARCH APP] CLEAR WIDGETS DATA';
// export const RESET_WORDCLOUD = "[SEARCH APP] RESET WORDCLOUD";
// export const RESET_SUBJECT_RELATION = "[SEARCH APP] RESET SUBJECT RELATION";
export const UPDATE_SUBJECT_RELATION = '[SEARCH APP] UPDATE SUBJECT RELATION';
export const RESET_SUBJECT_RELATION_VEC = '[SEARCH APP] RESET SUBJECT RELATION VEC';
// export const UPDATE_SUBJECT_RELATION_VEC ="[SEARCH APP] UPDATE SUBJECT RELATION VEC";
export const SAVE_VISUALTAB = '[SEARCH APP] SAVE VISUALTAB';
export const SET_SELECTED_INDEX = '[SEARCH APP] SET SELECTED INDEX';

export function getWordCloud(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/search-app/searchs/wordcloud`,
		{
			params
		},
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
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

// export function getWordCloud(searchText) {
//     // const request = axios.get('/api/academy-app/course', {params});

//     const request = axios({
//         method: "get",
//         timeout: 60 * 5 * 1000, // wait at least 5 mins
//         url: `${process.env.REACT_APP_API_URL}/api/search-app/searchs/wordcloud/${searchText}`
//     });

//     return dispatch =>
//         request.then(response =>
//             dispatch({
//                 type: GET_WORDCLOUD,
//                 payload: response.data
//             })
//         );
// }

export function getSubjectRelation(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/search-app/searchs/vec`,
		{
			params
		},
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
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
// export function getSubjectRelation(searchText) {
//     // const request = axios.get('/api/academy-app/course', {params});

//     const request = axios({
//         method: "get",
//         timeout: 60 * 5 * 1000, // wait at least 5 mins
//         url: `${process.env.REACT_APP_API_URL}/api/search-app/searchs/vec/${searchText}`
//     });

//     return dispatch =>
//         request.then(response =>
//             dispatch({
//                 type: GET_SUBJECT_RELATION,
//                 payload: response.data
//             })
//         );
// }

export function clearWidgetsData() {
	return {
		type: CLEAR_WIDGETS_DATA
	};
}
// export function resetWordCloud() {
//     return {
//         type: RESET_WORDCLOUD
//     };
// }

// export function resetSubjectRelation() {
//     return {
//         type: RESET_SUBJECT_RELATION
//     };
// }

export function resetSubjectRelationVec(data) {
	return {
		type: RESET_SUBJECT_RELATION_VEC,
		topic: data
	};
}

// TODO :: updateSubjectRelation API 최적화
export function updateSubjectRelation(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/search-app/searchs/vec`,
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
					payload: response.data.vec
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}
// export function updateSubjectRelation(params, vec) {
//     // const request = axios.get('/api/academy-app/course', {params});

//     const request = axios({
//         method: "get",
//         timeout: 60 * 5 * 1000, // wait at least 5 mins
//         url: `${process.env.REACT_APP_API_URL}/api/search-app/searchs/vec/${searchText}/${vec}`
//     });

//     return dispatch =>
//         request.then(response =>
//             dispatch({
//                 type: UPDATE_SUBJECT_RELATION,
//                 payload: response.data
//             })
//         );
// }

// export function updateSubjectRelationVec(data) {
//     return {
//         type: UPDATE_SUBJECT_RELATION_VEC,
//         selectedVec: data
//     };
// }

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
