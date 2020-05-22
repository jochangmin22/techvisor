import axios from 'axios';
// import { showMessage } from "app/store/actions/fuse";
import { getUserData } from 'app/main/apps/classify/store/actions/user.actions';

export const GET_CLASSIFY = '[CLASSIFY APP] GET CLASSIFY';
export const SET_CLASSIFY = '[CLASSIFY APP] SET CLASSIFY';
export const GET_CATEGORY = '[CLASSIFY APP] GET CATEGORY';
export const SET_SELECTED_DICTIONARY = '[CLASSIFY APP] SET SELECTED DICTIONARY';
export const GET_DICTIONARY = '[CLASSIFY APP] GET DICTIONARY';
export const SET_SEARCH_TEXT = '[CLASSIFY APP] SET SEARCH TEXT';
export const TOGGLE_IN_SELECTED_CLASSIFY = '[CLASSIFY APP] TOGGLE IN SELECTED CLASSIFY';
export const SELECT_ALL_CLASSIFY = '[CLASSIFY APP] SELECT ALL CLASSIFY';
export const DESELECT_ALL_CLASSIFY = '[CLASSIFY APP] DESELECT ALL CLASSIFY';
export const OPEN_NEW_CLASSIFY_DIALOG = '[CLASSIFY APP] OPEN NEW CLASSIFY DIALOG';
export const CLOSE_NEW_CLASSIFY_DIALOG = '[CLASSIFY APP] CLOSE NEW CLASSIFY DIALOG';
export const OPEN_EDIT_CLASSIFY_DIALOG = '[CLASSIFY APP] OPEN EDIT CLASSIFY DIALOG';
export const CLOSE_EDIT_CLASSIFY_DIALOG = '[CLASSIFY APP] CLOSE EDIT CLASSIFY DIALOG';
export const ADD_CLASSIFY = '[CLASSIFY APP] ADD CLASSIFY';
export const UPDATE_CLASSIFY = '[CLASSIFY APP] UPDATE CLASSIFY';
export const REMOVE_CLASSIFY = '[CLASSIFY APP] REMOVE CLASSIFY';
export const REMOVE_CLASSIFYS = '[CLASSIFY APP] REMOVE CLASSIFYS';
export const TOGGLE_STARRED_CLASSIFY = '[CLASSIFY APP] TOGGLE STARRED CLASSIFY';
export const TOGGLE_STARRED_CLASSIFYS = '[CLASSIFY APP] TOGGLE STARRED CLASSIFYS';
export const SET_CLASSIFY_STARRED = '[CLASSIFY APP] SET CLASSIFY STARRED ';

export function getClassify(routeParams) {
	const request = axios.get('/api/classify-app/classify', {
		params: routeParams
	});

	// const request = axios({
	//     method: "get",
	//     url: `http://192.168.0.50:8000/api/classify-app/classify/${searchText}`
	// });

	return dispatch =>
		request.then(
			response =>
				dispatch({
					type: GET_CLASSIFY,
					payload: response.data,
					routeParams
				})
			// error => {
			//     dispatch(
			//         showMessage({
			//             message: error.response.data,
			//             autoHideDuration: 2000,
			//             anchorOrigin: {
			//                 vertical: "top",
			//                 horizontal: "right"
			//             }
			//         })
			//     );
			//     // history.push({
			//     //     pathname: '/apps/scrumboard/boards'
			//     // });
			// }
		);
}

export function setClassify(data) {
	return {
		type: SET_CLASSIFY,
		payload: data
	};
}

export function getCategories() {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/classify-app/category`
	});

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_CATEGORY,
				payload: response.data
			})
		);
}

export function setSelectedDictionary(data) {
	return {
		type: SET_SELECTED_DICTIONARY,
		payload: data
	};
}

export function getDictionaries(data) {
	const request = axios({
		method: 'get',
		url: `${process.env.REACT_APP_API_URL}/api/classify-app/dictionary/${data}`
	});

	return dispatch =>
		request.then(response =>
			dispatch({
				type: GET_DICTIONARY,
				payload: response.data
			})
		);
}

export function setSearchText(event) {
	return {
		type: SET_SEARCH_TEXT,
		searchText: event.target.value
	};
}

export function toggleInSelectedClassify(classifyId) {
	return {
		type: TOGGLE_IN_SELECTED_CLASSIFY,
		classifyId
	};
}

export function selectAllClassify() {
	return {
		type: SELECT_ALL_CLASSIFY
	};
}

export function deSelectAllClassify() {
	return {
		type: DESELECT_ALL_CLASSIFY
	};
}

export function openNewClassifyDialog() {
	return {
		type: OPEN_NEW_CLASSIFY_DIALOG
	};
}

export function closeNewClassifyDialog() {
	return {
		type: CLOSE_NEW_CLASSIFY_DIALOG
	};
}

export function openEditClassifyDialog(data) {
	return {
		type: OPEN_EDIT_CLASSIFY_DIALOG,
		data
	};
}

export function closeEditClassifyDialog() {
	return {
		type: CLOSE_EDIT_CLASSIFY_DIALOG
	};
}

export function addClassify(newClassify) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/add-classify', {
			newClassify
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: ADD_CLASSIFY
				})
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function updateClassify(classify) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/update-classify', {
			classify
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: UPDATE_CLASSIFY
				})
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function removeClassify(classifyId) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/remove-classify', {
			classifyId
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: REMOVE_CLASSIFY
				})
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function removeClassifys(classifyIds) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/remove-classify', {
			classifyIds
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: REMOVE_CLASSIFY
				}),
				dispatch({
					type: DESELECT_ALL_CLASSIFY
				})
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function toggleStarredClassify(classifyId) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/toggle-starred-classify', {
			classifyId
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: TOGGLE_STARRED_CLASSIFY
				}),
				dispatch(getUserData())
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function toggleStarredClassifys(classifyIds) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/toggle-starred-classify', {
			classifyIds
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: TOGGLE_STARRED_CLASSIFY
				}),
				dispatch({
					type: DESELECT_ALL_CLASSIFY
				}),
				dispatch(getUserData())
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function setClassifyStarred(classifyIds) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/set-classify-starred', {
			classifyIds
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: SET_CLASSIFY_STARRED
				}),
				dispatch({
					type: DESELECT_ALL_CLASSIFY
				}),
				dispatch(getUserData())
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}

export function setClassifyUnstarred(classifyIds) {
	return (dispatch, getState) => {
		const { routeParams } = getState().classifyApp.classify;

		const request = axios.post('/api/classify-app/set-classify-unstarred', {
			classifyIds
		});

		return request.then(response =>
			Promise.all([
				dispatch({
					type: SET_CLASSIFY_STARRED
				}),
				dispatch({
					type: DESELECT_ALL_CLASSIFY
				}),
				dispatch(getUserData())
			]).then(() => dispatch(getClassify(routeParams)))
		);
	};
}
