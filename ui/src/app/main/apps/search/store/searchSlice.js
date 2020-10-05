import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/search-app/search/`;
const NAME = 'searchApp/search/';

export const getSearch = createAsyncThunk(NAME + 'getSearch', async params => {
	const response = await axios.get(URL, {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getQuote = createAsyncThunk(NAME + 'getQuote', async params => {
	const response = await axios.get(URL + 'quote', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getFamily = createAsyncThunk(NAME + 'getFamily', async params => {
	const response = await axios.get(URL + 'family', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getIpcCpc = createAsyncThunk(NAME + 'getIpcCpc', async params => {
	const response = await axios.get(URL + 'ipccpc', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getRnd = createAsyncThunk(NAME + 'getRnd', async params => {
	const response = await axios.get(URL + 'rnd', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getLegal = createAsyncThunk(NAME + 'getLegal', async params => {
	const response = await axios.get(URL + 'legal', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getRegisterFee = createAsyncThunk(NAME + 'getRegisterFee', async params => {
	const response = await axios.get(URL + 'registerfee', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getRightfullOrder = createAsyncThunk(NAME + 'getRightfullOrder', async params => {
	const response = await axios.get(URL + 'rightfullorder', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getRightHolder = createAsyncThunk(NAME + 'getRightHolder', async params => {
	const response = await axios.get(URL + 'rightholder', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getApplicant = createAsyncThunk(NAME + 'getApplicant', async params => {
	const response = await axios.get(URL + 'applicant', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getApplicantTrend = createAsyncThunk(NAME + 'getApplicantTrend', async params => {
	const response = await axios.get(URL + 'applicanttrend', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getApplicantIpc = createAsyncThunk(NAME + 'getApplicantIpc', async params => {
	const response = await axios.get(URL + 'applicantipc', {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getSimilar = createAsyncThunk(NAME + 'getSimilar', async params => {
	const response = await axios.get(URL + 'similar', {
		params: params
	});
	const data = await response.data;

	return data;
});

const searchAdapter = createEntityAdapter({});

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
	applicantIpc: null,
	similar: {
		entities: [],
		modelType: 'doc2vec' // ['doc2vec', 'cosine similarity'],
	}
};

const searchSlice = createSlice({
	name: 'searchApp/search',
	initialState: searchAdapter.getInitialState(initialState),
	reducers: {
		resetSearch: (state, action) => initialState,
		resetSimilar: (state, action) => {
			state.similar = initialState.similar;
		},
		updateSimilarModelType: (state, action) => {
			state.similar.modelType = action.payload;
		}
	},
	extraReducers: {
		[getSearch.fulfilled]: (state, action) => {
			state.search = action.payload;
		},
		[getQuote.fulfilled]: (state, action) => {
			state.quote = action.payload;
		},
		[getFamily.fulfilled]: (state, action) => {
			state.family = action.payload;
		},
		[getIpcCpc.fulfilled]: (state, action) => {
			state.ipcCpc = action.payload;
		},
		[getRnd.fulfilled]: (state, action) => {
			state.rnd = action.payload;
		},
		[getLegal.fulfilled]: (state, action) => {
			state.legal = action.payload;
		},
		[getRegisterFee.fulfilled]: (state, action) => {
			state.registerFee = action.payload;
		},
		[getRightfullOrder.fulfilled]: (state, action) => {
			state.rightfullOrder = action.payload;
		},
		[getRightHolder.fulfilled]: (state, action) => {
			state.rightHolder = action.payload;
		},
		[getApplicant.fulfilled]: (state, action) => {
			state.applicant = action.payload;
		},
		[getApplicantTrend.fulfilled]: (state, action) => {
			state.applicantTrend = action.payload;
		},
		[getApplicantIpc.fulfilled]: (state, action) => {
			state.applicantIpc = action.payload;
		},
		[getSimilar.fulfilled]: (state, action) => {
			state.similar = {
				...state.similar,
				entities: action.payload
			};
		}
	}
});

export const { resetSearch, resetSimilar, updateSimilarModelType } = searchSlice.actions;

export default searchSlice.reducer;
