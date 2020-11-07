import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/company-app/searchs/`;
const URL_OTHER = `${process.env.REACT_APP_API_URL}/api/search-app/searchs/`;
const NAME = 'companyApp/searchs/';

export const getSearchs = createAsyncThunk(NAME + 'getSearchs', async ({ params, subParams }) => {
	const response = await axios.post(URL, { params: params, subParams: subParams });
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

export const getFinancialInfo = createAsyncThunk(NAME + 'getFinancialInfo', async (params, { dispatch }) => {
	const response = await axios.post(URL + 'financialinfo', params);
	const data = await response.data;

	return data;
});

export const getClinicTest = createAsyncThunk(NAME + 'getClinicTest', async params => {
	const response = await axios.post(URL + 'clinic', params);
	const data = await response.data;

	return data;
});

export const getNews = createAsyncThunk(NAME + 'getNews', async ({ params, subParams }) => {
	const response = await axios.post(URL_OTHER + 'news', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getNewsSA = createAsyncThunk(NAME + 'getNewsSA', async ({ params, subParams }) => {
	const response = await axios.post(URL_OTHER + 'newssa', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getRelatedCompany = createAsyncThunk(NAME + 'getRelatedCompany', async ({ params, subParams }) => {
	const response = await axios.post(URL_OTHER + 'relatedcompany', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getDisclosureReport = createAsyncThunk(NAME + 'getDisclosureReport', async params => {
	const response = await axios.post(URL + 'disclosurereport', params);
	const data = await response.data;

	return data;
});

export const getOwnedPatent = createAsyncThunk(NAME + 'getOwnedPatent', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'ownedpatent', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getMatrix = createAsyncThunk(NAME + 'getMatrix', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'matrix', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getMatrixDialog = createAsyncThunk(NAME + 'getMatrixDialog', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'matrixdialog', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getWordCloud = createAsyncThunk(NAME + 'getWordCloud', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'wordcloud', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getKeywords = createAsyncThunk(NAME + 'getKeywords', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'vec', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getKeywordsVec = createAsyncThunk(NAME + 'getKeywordsVec', async (params, subParams, { dispatch }) => {
	const response = dispatch(getKeywords({ params, subParams }));
	const data = response.data;

	return data;
});

export const getIndicator = createAsyncThunk(NAME + 'getIndicator', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'indicator', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getStockSearchTop = createAsyncThunk(NAME + 'stocksearchtop', async () => {
	const response = await axios.post(URL + 'stocksearchtop');
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
	menuOptions: {
		wordCloudOptions: {
			volume: '요약',
			unit: '구문', // '구문', '워드',
			output: 50
		},
		clinicOptions: {
			category: '연도별',
			volume: '요약',
			unit: '구문',
			output: 50
		}
	},
	searchLoading: null,
	searchSubmit: null,
	selectedCorp: {
		stockCode: '',
		corpNo: '',
		corpName: ''
	},
	cols: [
		{ header: '종목코드', accessor: '종목코드', width: 110, sortIndex: 0, colorize: false, visible: true },
		{ header: '회사명', accessor: '회사명', width: 180, sortIndex: 1, colorize: false, visible: true },
		{ header: '업종', accessor: '업종', width: 200, sortIndex: 2, colorize: false, visible: true },
		{ header: '주요제품', accessor: '주요제품', width: 400, sortIndex: 3, colorize: false, visible: true },
		{ header: '대표자명', accessor: '대표자명', width: 150, sortIndex: 4, colorize: false, visible: true },
		{ header: '시가총액', accessor: '시가총액', width: 100, sortIndex: 5, colorize: false, visible: true },
		{ header: '업종PER(배)', accessor: '업종PER(배)', width: 100, sortIndex: 6, colorize: false, visible: true },
		{ header: 'PER(배)', accessor: 'PER(배)', width: 100, sortIndex: 7, colorize: false, visible: true },
		{ header: 'PER갭(%)', accessor: 'PER갭(%)', width: 100, sortIndex: 8, colorize: false, visible: true },
		{ header: 'PRR(배)', accessor: 'PRR(배)', width: 100, sortIndex: 9, colorize: false, visible: true },
		{ header: 'PGF(%)', accessor: 'PGF(%)', width: 100, sortIndex: 10, colorize: true, visible: true },
		{ header: 'PBR(배)', accessor: 'PBR(배)', width: 100, sortIndex: 11, colorize: false, visible: true },
		{ header: 'EPS(원)', accessor: 'EPS(원)', width: 100, sortIndex: 12, colorize: true, visible: true },
		{ header: 'ROE(%)', accessor: 'ROE(%)', width: 100, sortIndex: 13, colorize: true, visible: true },
		{ header: 'ROA(%)', accessor: 'ROA(%)', width: 100, sortIndex: 14, colorize: true, visible: true },
		{ header: '현재가', accessor: '현재가', width: 100, sortIndex: 15, colorize: false, visible: true },
		{ header: '적정가', accessor: '적정가', width: 100, sortIndex: 16, colorize: false, visible: true },
		{
			header: '영업이익증감(전전)',
			accessor: '영업이익증감(전전)',
			width: 130,
			sortIndex: 17,
			colorize: true,
			visible: true
		},
		{
			header: '순이익증감(전전)',
			accessor: '순이익증감(전전)',
			width: 130,
			sortIndex: 18,
			colorize: true,
			visible: true
		},
		{
			header: '영업이익증감(직전)',
			accessor: '영업이익증감(직전)',
			width: 130,
			sortIndex: 19,
			colorize: true,
			visible: true
		},
		{
			header: '순이익증감(직전)',
			accessor: '순이익증감(직전)',
			width: 130,
			sortIndex: 20,
			colorize: true,
			visible: true
		},
		{ header: '부채비율', accessor: '부채비율', width: 130, sortIndex: 21, colorize: false, visible: true },
		{
			header: '현금배당수익률',
			accessor: '현금배당수익률',
			width: 100,
			sortIndex: 22,
			colorize: false,
			visible: true
		},
		{ header: '적정가(1)', accessor: '적(1)PER*EPS', width: 100, sortIndex: 23, colorize: false, visible: false },
		{ header: '적정가(2)', accessor: '적(2)ROE*EPS', width: 100, sortIndex: 24, colorize: false, visible: false },
		{ header: '적정가(3)', accessor: '적(3)EPS*10', width: 100, sortIndex: 25, colorize: false, visible: false },
		{ header: '적정가(4)', accessor: '적(4)s-lim', width: 100, sortIndex: 26, colorize: false, visible: false },
		{
			header: '적정가(5)',
			accessor: '적(5)당기순이익*PER',
			width: 100,
			sortIndex: 27,
			colorize: false,
			visible: false
		}
	],
	stock: {
		entities: [],
		chartType: 'year',
		stockInfo: []
	},
	stockSearchTop: [],
	companyInfo: {},
	financialInfo: {},
	clinicTest: [],
	disclosureReport: [],
	ownedPatent: [],
	wordCloud: [],
	news: [],
	newsSA: null,
	relatedCompany: {
		stockCode: '',
		corpName: ''
	}
};

const searchsSlice = createSlice({
	name: 'companyApp/searchs',
	initialState: searchsAdapter.getInitialState(initialState),
	reducers: {
		setMockData: (state, action) => {
			const { entities, searchParams, matrix, keywords } = action.payload;

			state.entities = entities;
			state.searchParams = searchParams;
			state.matrix = matrix;
			state.keywords = keywords;
		},
		clearSearchs: (state, action) => {
			const { entities, selectedCorp, wordCloud, keywords, indicator } = initialState;

			state.entities = entities;
			state.selectedCorp = selectedCorp;
			state.wordCloud = wordCloud;
			state.keywords = keywords;
			state.indicator = indicator;
		},
		// clearSearchText: (state, action) => initialState,
		clearSearchText: (state, action) => {
			const { entities, searchParams, selectedCorp, wordCloud, news, newsSA, relatedCompany } = initialState;

			if (initialState.selectedCorp.corpName !== action.payload) {
				// no need to reset
				state.news = news;
				state.newsSA = newsSA;
				state.relatedCompany = relatedCompany;
			}
			state.entities = entities;
			state.searchParams = searchParams;
			state.wordCloud = wordCloud;
			state.selectedCorp = selectedCorp;
		},
		setSearchLoading: (state, action) => {
			state.searchLoading = action.payload;
		},
		setSelectedCorp: (state, action) => {
			state.selectedCorp = action.payload;
		},
		resetSelectedCorp: (state, action) => {
			state.selectedCorp = initialState.selectedCorp;
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
			state.menuOptions.wordCloudOptions = action.payload;
		},
		setkeywordsOptions: (state, action) => {
			state.menuOptions.keywordsOptions = action.payload;
		},
		setMatrixOptions: (state, action) => {
			state.menuOptions.matrixOptions = action.payload;
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
		resetCols: (state, action) => {
			state.cols = initialState.cols;
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
		[getFinancialInfo.fulfilled]: (state, action) => {
			state.financialInfo = action.payload;
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
		},
		[getStockSearchTop.fulfilled]: (state, action) => {
			state.stockSearchTop = action.payload;
		}
	}
});

export const {
	setMockData,
	clearSearchs,
	clearSearchText,
	setSearchLoading,
	setSelectedCorp,
	resetSelectedCorp,
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
	resetCols,
	resetKeywordsVec,
	updateKeywordsModelType
} = searchsSlice.actions;

export default searchsSlice.reducer;
