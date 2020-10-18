import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/company-app/searchs/`;
const URL_OTHER = `${process.env.REACT_APP_API_URL}/api/search-app/searchs/`;
const NAME = 'companyApp/searchs/';

export const getSearchs = createAsyncThunk(NAME + 'getSearchs', async (params, subParams) => {
	const response = await axios.get(URL, { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getStock = createAsyncThunk(NAME + 'getStock', async params => {
	const response = await axios.post(URL + 'stock', params);
	const data = await response.data;

	return data;
});

export const getStockInfo = createAsyncThunk(NAME + 'getStockInfo', async (params, { dispatch }) => {
	const response = await axios.post(URL + 'stockinfo', params);
	const data = await response.data;

	return data;
});

export const getCompanyInfo = createAsyncThunk(NAME + 'getCompanyInfo', async (params, { dispatch }) => {
	const response = await axios.post(URL + 'companyinfo', params);
	const data = await response.data;

	const { 종목코드 } = data;
	if (종목코드) {
		dispatch(getStock({ stockCode: 종목코드 }));
		dispatch(getStockInfo({ stockCode: 종목코드 }));
	}

	return data;
});

export const getClinicTest = createAsyncThunk(NAME + 'getClinicTest', async params => {
	const response = await axios.post(URL + 'clinic', params);
	const data = await response.data;

	return data;
});

export const getNews = createAsyncThunk(NAME + 'getNews', async (params, subParams) => {
	const response = await axios.get(URL_OTHER + 'news', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getNewsSA = createAsyncThunk(NAME + 'getNewsSA', async (params, subParams) => {
	const response = await axios.get(URL_OTHER + 'newssa', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getRelatedCompany = createAsyncThunk(NAME + 'getRelatedCompany', async (params, subParams) => {
	const response = await axios.get(URL_OTHER + 'relatedcompany', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getDisclosureReport = createAsyncThunk(NAME + 'getDisclosureReport', async params => {
	const response = await axios.post(URL + 'disclosurereport', params);
	const data = await response.data;

	return data;
});

export const getOwnedPatent = createAsyncThunk(NAME + 'getOwnedPatent', async params => {
	const response = await axios.post(URL + 'ownedpatent', params);
	const data = await response.data;

	return data;
});

export const getMatrix = createAsyncThunk(NAME + 'getMatrix', async (params, subParams) => {
	const response = await axios.get(URL + 'matrix', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getMatrixDialog = createAsyncThunk(NAME + 'getMatrixDialog', async (params, subParams) => {
	const response = await axios.get(URL + 'matrixdialog', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getWordCloud = createAsyncThunk(NAME + 'getWordCloud', async (params, subParams) => {
	const response = await axios.get(URL + 'wordcloud', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getKeywords = createAsyncThunk(NAME + 'getKeywords', async (params, subParams) => {
	const response = await axios.get(URL + 'vec', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getKeywordsVec = createAsyncThunk(NAME + 'getKeywordsVec', async (params, subParams, { dispatch }) => {
	const response = dispatch(getKeywords({ params, subParams }));
	const data = response.data;

	return data;
});

export const getIndicator = createAsyncThunk(NAME + 'getIndicator', async (params, subParams) => {
	const response = await axios.get(URL + 'indicator', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

const searchsAdapter = createEntityAdapter({});

export const { selectAll: selectSearchs, selectById: selectSearchById } = searchsAdapter.getSelectors(
	state => state.companyApp.searchs.entities
);

export const initialState = {
	entities: [],
	searchParams: {
		searchText: '',
		searchNum: '',
		companyName: [],
		bizDomain: [],
		mainProduct: [],
		marketCapStart: '',
		marketCapEnd: '',
		perStart: '',
		perEnd: '',
		pbrStart: '',
		pbrEnd: '',
		epsStart: '',
		epsEnd: '',
		roeStart: '',
		roeEnd: '',
		roaStart: '',
		roaEnd: '',
		nowPriceStart: '',
		nowPriceEnd: '',
		operatingProfitTBQStart: '',
		operatingProfitTBQEnd: '',
		netIncomeTBQStart: '',
		netIncomeTBQEnd: '',
		operatingProfitBQStart: '',
		operatingProfitBQEnd: '',
		netIncomeBQStart: '',
		netIncomeBQEnd: ''
	},
	clinicOptions: {
		category: '연도별', // '국가별', '연도별', '기술별', '기업별'
		volume: '요약',
		unit: '구문', // '구문', '워드',
		output: 50
	},
	searchLoading: null,
	searchSubmit: null,
	selectedCode: {
		stockCode: '',
		corpNo: ''
	},
	cols: ['1', '2', '3', '4', '5', '6', '7', '8'],
	stock: {
		entities: [],
		chartType: 'year',
		stockInfo: []
	},
	companyInfo: [],
	clinicTest: [],
	disclosureReport: [],
	ownedPatent: [],
	news: [],
	newsSA: null,
	relatedCompany: []
};

const searchsSlice = createSlice({
	name: 'companyApp/searchs',
	initialState: searchsAdapter.getInitialState(initialState),
	reducers: {
		setMockData: (state, action) => {
			const { entities, searchParams, matrix, wordCloud, keywords } = action.payload;

			state.entities = entities;
			state.searchParams = searchParams;
			state.matrix = matrix;
			state.wordCloud = wordCloud;
			state.keywords = keywords;
		},
		clearSearchs: (state, action) => {
			const { entities, wordCloud, keywords, indicator } = initialState;

			state.entities = entities;
			state.wordCloud = wordCloud;
			state.keywords = keywords;
			state.indicator = indicator;
		},
		clearSearchText: (state, action) => initialState,

		setSearchLoading: (state, action) => {
			state.searchLoading = action.payload;
		},
		setSelectedCode: (state, action) => {
			state.selectedCode = action.payload;
		},
		resetSelectedCode: (state, action) => {
			state.selectedCode = initialState.selectedCode;
			state.stock = initialState.stock;
		},
		setSearchParams: (state, action) => {
			state.searchParams = action.payload;
		},
		setSearchNum: (state, action) => {
			state.searchParams.searchNum = action.payload;
		},
		setSearchVolume: (state, action) => {
			state.searchParams.searchVolume = action.payload;
		},
		setWordCloudOptions: (state, action) => {
			state.analysisOptions.wordCloudOptions = action.payload;
		},
		setkeywordsOptions: (state, action) => {
			state.analysisOptions.keywordsOptions = action.payload;
		},
		setMatrixOptions: (state, action) => {
			state.analysisOptions.matrixOptions = action.payload;
		},
		setSearchSubmit: (state, action) => {
			state.searchSubmit = action.payload;
		},
		updateMatrixCategory: (state, action) => {
			state.matrix.category = action.payload;
		},
		openMatrixDialog: (state, action) => {
			state.matrixDialog.props.open = true;
		},
		closeMatrixDialog: (state, action) => {
			state.matrixDialog = initialState.matrixDialog;
		},
		updateCols: (state, action) => {
			state.cols = action.payload;
		},
		resetKeywordsVec: (state, action) => {
			state.keywords = { ...initialState.keywords, vec: initialState.keywords.vec };
		}
	},
	extraReducers: {
		[getSearchs.fulfilled]: (state, action) => {
			state.entities = action.payload;
		},
		[getStock.fulfilled]: (state, action) => {
			state.stock.entities = action.payload;
		},
		[getStockInfo.fulfilled]: (state, action) => {
			state.stock.stockInfo = action.payload;
		},
		[getCompanyInfo.fulfilled]: (state, action) => {
			state.companyInfo = action.payload;
		},
		[getClinicTest.fulfilled]: (state, action) => {
			state.clinicTest = action.payload;
		},
		[getNews.fulfilled]: (state, action) => {
			state.news = action.payload;
		},
		[getNewsSA.fulfilled]: (state, action) => {
			state.newsSA = action.payload;
		},
		[getRelatedCompany.fulfilled]: (state, action) => {
			state.relatedCompany = action.payload;
		},
		[getDisclosureReport.fulfilled]: (state, action) => {
			state.disclosureReport = action.payload;
		},
		[getOwnedPatent.fulfilled]: (state, action) => {
			state.ownedPatent = action.payload;
		},
		[getMatrix.fulfilled]: (state, action) => {
			const { entities, max } = action.payload;
			state.matrix = { ...state.matrix, entities: entities, max: max };
		},
		[getMatrixDialog.fulfilled]: (state, action) => {
			state.matrixDialog = {
				...state.matrixDialog,
				data: action.payload
			};
		},
		[getWordCloud.fulfilled]: (state, action) => {
			state.wordCloud = action.payload;
		},
		[getKeywords.pending]: (state, action) => {
			state.keywords = { ...state.keywords, vec: initialState.keywords.vec };
		},
		[getKeywords.fulfilled]: (state, action) => {
			state.keywords = action.payload;
		},
		[getKeywordsVec.pending]: (state, action) => {
			state.keywords = { ...state.keywords, vec: initialState.keywords.vec };
		},
		[getKeywordsVec.fulfilled]: (state, action) => {
			state.keywords = { ...state.keywords, vec: action.payload.vec };
		},
		[getIndicator.fulfilled]: (state, action) => {
			state.indicator = action.payload;
		}
	}
});

export const {
	setMockData,
	clearSearchs,
	clearSearchText,
	setSearchLoading,
	setSelectedCode,
	resetSelectedCode,
	setSearchParams,
	setSearchNum,
	setSearchVolume,
	setWordCloudOptions,
	setkeywordsOptions,
	setMatrixOptions,
	setSearchSubmit,
	updateMatrixCategory,
	openMatrixDialog,
	closeMatrixDialog,
	updateCols,
	resetKeywordsVec,
	updateKeywordsModelType
} = searchsSlice.actions;

export default searchsSlice.reducer;
