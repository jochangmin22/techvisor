import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/search-app/search/`;
const NAME = 'searchApp/search/';

export const getClassify = createAsyncThunk(NAME + 'getClassify', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL, {
		params: routeParams
	});
	const data = await response.data;

	// dispatch(setClickedSearchId(routeParams.appNo));

	return {
		data,
		routeParams
	};
});

export const getCategories = createAsyncThunk(NAME + 'getCategories', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'quote', {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
});

export const getDictionaries = createAsyncThunk(NAME + 'getDictionaries', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'family', {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
});

export const addClassify = createAsyncThunk(NAME + 'addClassify', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'ipccpc', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const updateClassify = createAsyncThunk(NAME + 'updateClassify', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'rnd', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const removeClassify = createAsyncThunk(NAME + 'removeClassify', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'legal', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const removeClassifys = createAsyncThunk(NAME + 'removeClassifys', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'registerfee', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const toggleStarredClassify = createAsyncThunk(
	NAME + 'toggleStarredClassify',
	async (routeParams, { getState }) => {
		routeParams = routeParams || getState().searchApp.search.routeParams;
		const response = await axios.get(URL + 'rightfullorder', {
			params: routeParams
		});
		const data = await response.data;

		return { data, routeParams };
	}
);

export const toggleStarredClassifys = createAsyncThunk(
	NAME + 'toggleStarredClassifys',
	async (routeParams, { getState }) => {
		routeParams = routeParams || getState().searchApp.search.routeParams;
		const response = await axios.get(URL + 'rightholder', {
			params: routeParams
		});
		const data = await response.data;

		return { data, routeParams };
	}
);

export const setClassifyStarred = createAsyncThunk(NAME + 'setClassifyStarred', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'applicant', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const setClassifyUnstarred = createAsyncThunk(
	NAME + 'setClassifyUnstarred',
	async (routeParams, { getState }) => {
		routeParams = routeParams || getState().searchApp.search.routeParams;
		const response = await axios.get(URL + 'applicanttrend', {
			params: routeParams
		});
		const data = await response.data;

		return { data, routeParams };
	}
);

const classifyAdapter = createEntityAdapter({});

const initialState = {
	search: null,
	quote: null,
	family: null,
	ipcCpc: [],
	rnd: [],
	legal: null,
	registerFee: null,
	rightfullOrder: null,
	rightHolder: null,
	applicant: null,
	applicantTrend: null,
	similar: {
		entities: [],
		modelType: 'doc2vec' // ['doc2vec', 'cosine similarity'],
	}
};

const classifySlice = createSlice({
	name: 'classifyApp/classify',
	initialState: classifyAdapter.getInitialState(initialState),
	reducers: {
		setClassify: (state, action) => {
			state.entities = action.payload;
		},
		setSelectedDictionary: (state, action) => {
			state.similar = initialState.similar;
		},
		setSearchText: (state, action) => {
			state.similar.modelType = action.payload;
		},
		toggleInSelectedClassify: (state, action) => {
			state.similar.modelType = action.payload;
		},
		selectAllClassify: (state, action) => {
			state.similar.modelType = action.payload;
		},
		deSelectAllClassify: (state, action) => {
			state.similar.modelType = action.payload;
		},
		openNewClassifyDialog: (state, action) => {
			state.similar.modelType = action.payload;
		},
		closeNewClassifyDialog: (state, action) => {
			state.similar.modelType = action.payload;
		},
		openEditClassifyDialog: (state, action) => {
			state.similar.modelType = action.payload;
		},
		closeEditClassifyDialog: (state, action) => {
			state.similar.modelType = action.payload;
		}
	},
	extraReducers: {
		[getClassify.fulfilled]: (state, action) => {
			state.search = action.payload;
		},
		[getCategories.fulfilled]: (state, action) => {
			state.quote = action.payload;
		},
		[getDictionaries.fulfilled]: (state, action) => {
			state.family = action.payload;
		},
		[addClassify.fulfilled]: (state, action) => {
			state.ipcCpc = action.payload;
		},
		[updateClassify.fulfilled]: (state, action) => {
			state.rnd = action.payload;
		},
		[removeClassify.fulfilled]: (state, action) => {
			state.legal = action.payload;
		},
		[removeClassifys.fulfilled]: (state, action) => {
			state.registerFee = action.payload;
		},
		[toggleStarredClassify.fulfilled]: (state, action) => {
			state.rightfullOrder = action.payload;
		},
		[toggleStarredClassifys.fulfilled]: (state, action) => {
			state.rightHolder = action.payload;
		},
		[setClassifyStarred.fulfilled]: (state, action) => {
			state.applicant = action.payload;
		},
		[setClassifyUnstarred.fulfilled]: (state, action) => {
			state.applicantTrend = action.payload;
		}
	}
});

export const {
	setClassify,
	setSelectedDictionary,
	setSearchText,
	toggleInSelectedClassify,
	selectAllClassify,
	deSelectAllClassify,
	openNewClassifyDialog,
	openEditClassifyDialog,
	closeNewClassifyDialog,
	closeEditClassifyDialog
} = classifySlice.actions;

export default classifySlice.reducer;
