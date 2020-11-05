import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/search-app/search/`;
const NAME = 'searchApp/search/';

export const getSearch = createAsyncThunk(NAME + 'getSearch', async params => {
	const response = await axios.post(URL, params);
	const data = await response.data;

	return data;
});

export const getQuote = createAsyncThunk(NAME + 'getQuote', async params => {
	const response = await axios.post(URL + 'quote', params);
	const data = await response.data;

	return data;
});

export const getFamily = createAsyncThunk(NAME + 'getFamily', async params => {
	const response = await axios.post(URL + 'family', params);
	const data = await response.data;

	return data;
});

export const getIpcCpc = createAsyncThunk(NAME + 'getIpcCpc', async params => {
	const response = await axios.post(URL + 'ipccpc', params);
	const data = await response.data;

	return data;
});

export const getRnd = createAsyncThunk(NAME + 'getRnd', async params => {
	const response = await axios.post(URL + 'rnd', params);
	const data = await response.data;

	return data;
});

export const getLegal = createAsyncThunk(NAME + 'getLegal', async params => {
	const response = await axios.post(URL + 'legal', params);
	const data = await response.data;

	return data;
});

export const getRegisterFee = createAsyncThunk(NAME + 'getRegisterFee', async params => {
	const response = await axios.post(URL + 'registerfee', params);
	const data = await response.data;

	return data;
});

export const getRightfullOrder = createAsyncThunk(NAME + 'getRightfullOrder', async params => {
	const response = await axios.post(URL + 'rightfullorder', params);
	const data = await response.data;

	return data;
});

export const getRightHolder = createAsyncThunk(NAME + 'getRightHolder', async params => {
	const response = await axios.post(URL + 'rightholder', params);
	const data = await response.data;

	return data;
});

export const getApplicant = createAsyncThunk(NAME + 'getApplicant', async params => {
	const response = await axios.post(URL + 'applicant', params);
	const data = await response.data;

	return data;
});

export const getApplicantTrend = createAsyncThunk(NAME + 'getApplicantTrend', async params => {
	const response = await axios.post(URL + 'applicanttrend', params);
	const data = await response.data;

	return data;
});

export const getApplicantIpc = createAsyncThunk(NAME + 'getApplicantIpc', async params => {
	const response = await axios.post(URL + 'applicantipc', params);
	const data = await response.data;

	return data;
});

export const getSimilar = createAsyncThunk(NAME + 'getSimilar', async params => {
	const response = await axios.post(URL + 'similar', params);
	const data = await response.data;

	return data;
});

export const getAssociateCorp = createAsyncThunk(NAME + 'getAssociateCorp', async params => {
	const response = await axios.post(URL + 'associatecorp', params);
	const data = await response.data;

	return data;
});

const searchAdapter = createEntityAdapter({});

const initialState = {
	search: {
		등록사항: '',
		명칭: '',
		영문명칭: '',
		출원인1: '',
		출원인코드1: '',
		출원인주소1: '',
		출원인국가코드1: '',
		전문소token: '',
		등록번호: '',
		초록: '',
		청구항종류: [],
		청구항들: [],
		기술분야: '',
		배경기술: '',
		'발명의 내용': '',
		'해결 하고자하는 과제': '',
		'과제 해결수단': '',
		효과: '',
		'발명의 실시를 위한 구체적인 내용': '',
		'부호의 설명': '',
		'도면의 간단한 설명': '',
		'발명의 상세한 설명': '',
		'발명의 목적': '',
		'발명이 속하는 기술 및 그 분야의 종래기술': '',
		'발명이 이루고자 하는 기술적 과제': '',
		'발명의 구성 및 작동': '',
		'발명의 효과': '',
		descPart: []
	},
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
	},
	associateCorp: [],
	cols: ['1', '2', '3', '4', '5', '6', '7', '8'],
	selectedAppNo: null
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
		},
		[getAssociateCorp.fulfilled]: (state, action) => {
			state.associateCorp = action.payload;
		}
	}
});

export const { resetSearch, resetSimilar, updateSimilarModelType } = searchSlice.actions;

export default searchSlice.reducer;
