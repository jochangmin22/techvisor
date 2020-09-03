import axios from 'axios';
// import { showMessage } from "app/store/actions/fuse";

export const GET_SEARCHS = '[COMPANY APP] GET SEARCHS';
export const CLEAR_SEARCHS = '[COMPANY APP] CLEAR SEARCHS';
export const CLEAR_SEARCH_TEXT = '[COMPANY APP] CLEAR SEARCH TEXT';
export const SET_SEARCH_LOADING = '[COMPANY APP] SET SEARCH LOADING';
export const SET_CLICKED_SEARCH_ID = '[COMPANY APP] SET CLICKED SEARCH ID';
export const SET_SEARCH_PARAMS = '[COMPANY APP] SET SEARCH PARAMS';
export const SET_SEARCH_NUM = '[COMPANY APP] SET SEARCH NUM';
export const SET_SEARCH_VOLUME = '[COMPANY APP] SET SEARCH VOLUME';
export const SET_SEARCH_SUBMIT = '[COMPANY APP] SET SEARCH SUBMIT';

export const SET_MOCK_DATA = '[COMPANY APP] SET MOCK DATA';

// visual parts
export const GET_WORDCLOUD = '[COMPANY APP] GET WORDCLOUD';
export const GET_SUBJECT_RELATION = '[COMPANY APP] GET SUBJECT RELATION';
export const UPDATE_SUBJECT_RELATION = '[COMPANY APP] UPDATE SUBJECT RELATION';
export const RESET_SUBJECT_RELATION_VEC = '[COMPANY APP] RESET SUBJECT RELATION VEC';
export const SAVE_VISUALTAB = '[COMPANY APP] SAVE VISUALTAB';
export const SET_SELECTED_INDEX = '[COMPANY APP] SET SELECTED INDEX';

export const GET_TOPIC_CHIPS = '[COMPANY APP] GET TOPIC CHIPS';
export const GET_NEWS = '[COMPANY APP] GET NEWS';
export const GET_MATRIX = '[COMPANY APP] GET MATRIX';
export const UPDATE_MATRIX_CATEGORY = '[COMPANY APP] UPDATE MATRIX CATEGORY';

export const UPDATE_COLS = '[COMPANY APP] UPDATE COLS';

export function getSearchs(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs`,
		{ params },
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_SEARCHS,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function setMockData(data) {
	return {
		type: SET_MOCK_DATA,
		// searchText: data.searchText,
		entities: data.entities,
		searchParams: data.searchParams,
		matrix: data.matrix,
		wordCloud: data.wordCloud,
		keywords: data.keywords
	};
}

export function clearSearchs() {
	return {
		type: CLEAR_SEARCHS
	};
}

export function getSearchsNum(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs_num`,
		{ params },
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_SEARCHS,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function clearSearchText() {
	return {
		type: CLEAR_SEARCH_TEXT
	};
}

export function setSearchLoading(data) {
	return {
		type: SET_SEARCH_LOADING,
		searchLoading: data
	};
}

export function getTopicChips(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs/topic`,
		{
			params
		},
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_TOPIC_CHIPS,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function setClickedSearchId(searchId) {
	return {
		type: SET_CLICKED_SEARCH_ID,
		payload: searchId
	};
}

export function setSearchParams(params) {
	return {
		type: SET_SEARCH_PARAMS,
		searchParams: params
	};
}

export function setSearchNum(data) {
	return {
		type: SET_SEARCH_NUM,
		searchNum: data
	};
}

export function setSearchVolume(data) {
	return {
		type: SET_SEARCH_VOLUME,
		searchVolume: data
	};
}

export function setSearchSubmit(data) {
	return {
		type: SET_SEARCH_SUBMIT,
		searchSubmit: data
	};
}

export function getNews(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs/news`,
		{ params },
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_NEWS,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function getMatrix(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs/matrix`,
		{ params },
		{ timeout: 1000 * 60 * 0.5 } // 0.5 minute
	);

	return dispatch =>
		request
			.then(response =>
				dispatch({
					type: GET_MATRIX,
					payload: response.data
				})
			)
			.catch(err => {
				console.log(err.code);
				console.log(err.message);
			});
}

export function updateMatrixCategory(data) {
	return {
		type: UPDATE_MATRIX_CATEGORY,
		matrixCategory: data
	};
}

export function updateCols(cols) {
	return {
		type: UPDATE_COLS,
		cols: cols
	};
}

// visual parts
export function getWordCloud(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs/wordcloud`,
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

export function getKeywords(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs/vec`,
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

export function resetKeywordsVec(data) {
	return {
		type: RESET_SUBJECT_RELATION_VEC,
		topic: data
	};
}

// TODO :: updateKeywords API 최적화
export function updateKeywords(params) {
	const request = axios.get(
		`${process.env.REACT_APP_API_URL}/api/company-app/searchs/vec`,
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

export function setSelectedIndex(data) {
	return {
		type: SET_SELECTED_INDEX,
		selectedIndex: data.selectedIndex
	};
}
