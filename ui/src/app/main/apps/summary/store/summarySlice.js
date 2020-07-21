import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/summary-app/summary/`;
const NAME = 'summaryApp/summary/';

export const getSummary = createAsyncThunk(NAME + 'getSummary', async (routeParams, { getState }) => {
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

export const addSummary = createAsyncThunk(NAME + 'addSummary', async (routeParams, { getState }) => {
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

export const updateSummary = createAsyncThunk(NAME + 'updateSummary', async (routeParams, { getState }) => {
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

export const removeSummary = createAsyncThunk(NAME + 'removeSummary', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'ipccpc', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const removeSummarys = createAsyncThunk(NAME + 'removeSummarys', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'rnd', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const toggleStarredSummary = createAsyncThunk(
	NAME + 'toggleStarredSummary',
	async (routeParams, { getState }) => {
		routeParams = routeParams || getState().searchApp.search.routeParams;
		const response = await axios.get(URL + 'legal', {
			params: routeParams
		});
		const data = await response.data;

		return { data, routeParams };
	}
);

export const toggleStarredSummarys = createAsyncThunk(
	NAME + 'toggleStarredSummarys',
	async (routeParams, { getState }) => {
		routeParams = routeParams || getState().searchApp.search.routeParams;
		const response = await axios.get(URL + 'registerfee', {
			params: routeParams
		});
		const data = await response.data;

		return { data, routeParams };
	}
);

export const setSummaryStarred = createAsyncThunk(NAME + 'setSummaryStarred', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'rightfullorder', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const setSummaryUnstarred = createAsyncThunk(NAME + 'setSummaryUnstarred', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().searchApp.search.routeParams;
	const response = await axios.get(URL + 'rightholder', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

const summaryAdapter = createEntityAdapter({});

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
		modelType: 'doc2vec' // ['doc2vec', 'cosine simility'],
	}
};

const summarySlice = createSlice({
	name: 'summaryApp/summary',
	initialState: summaryAdapter.getInitialState(initialState),
	reducers: {
		setSummary: (state, action) => initialState,
		setSearchText: (state, action) => {
			state.similar = initialState.similar;
		},
		toggleInSelectedSummary: (state, action) => {
			state.similar.modelType = action.payload;
		},
		selectAllSummary: (state, action) => {
			state.similar.modelType = action.payload;
		},
		deSelectAllSummary: (state, action) => {
			state.similar.modelType = action.payload;
		},
		openNewSummaryDialog: (state, action) => {
			state.similar.modelType = action.payload;
		},
		closeNewSummaryDialog: (state, action) => {
			state.similar.modelType = action.payload;
		},
		openEditSummaryDialog: (state, action) => {
			state.similar.modelType = action.payload;
		},
		closeEditSummaryDialog: (state, action) => {
			state.similar.modelType = action.payload;
		}
	},
	extraReducers: {
		[getSummary.fulfilled]: (state, action) => {
			state.search = action.payload;
		},
		[addSummary.fulfilled]: (state, action) => {
			state.quote = action.payload;
		},
		[updateSummary.fulfilled]: (state, action) => {
			state.family = action.payload;
		},
		[removeSummary.fulfilled]: (state, action) => {
			state.ipcCpc = action.payload;
		},
		[removeSummarys.fulfilled]: (state, action) => {
			state.rnd = action.payload;
		},
		[toggleStarredSummary.fulfilled]: (state, action) => {
			state.legal = action.payload;
		},
		[toggleStarredSummarys.fulfilled]: (state, action) => {
			state.registerFee = action.payload;
		},
		[setSummaryStarred.fulfilled]: (state, action) => {
			state.rightfullOrder = action.payload;
		},
		[setSummaryUnstarred.fulfilled]: (state, action) => {
			state.rightHolder = action.payload;
		}
	}
});

export const {
	setSummary,
	setSearchText,
	toggleInSelectedSummary,
	selectAllSummary,
	deSelectAllSummary,
	openNewSummaryDialog,
	closeNewSummaryDialog,
	openEditSummaryDialog,
	closeEditSummaryDialog
} = summarySlice.actions;

export default summarySlice.reducer;
