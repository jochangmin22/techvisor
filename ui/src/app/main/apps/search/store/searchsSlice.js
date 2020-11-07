import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/search-app/searchs/`;
const NAME = 'searchApp/search/';

export const getSearchs = createAsyncThunk(NAME + 'getSearchs', async ({ params, subParams }) => {
	const response = await axios.post(URL, { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getNews = createAsyncThunk(NAME + 'getNews', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'news', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getNewsSA = createAsyncThunk(NAME + 'getNewsSA', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'newssa', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getRelatedCompany = createAsyncThunk(NAME + 'getRelatedCompany', async ({ params, subParams }) => {
	const response = await axios.post(URL + 'relatedcompany', { params: params, subParams: subParams });
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

const searchsAdapter = createEntityAdapter({});

export const { selectAll: selectSearchs, selectById: selectSearchById } = searchsAdapter.getSelectors(
	state => state.searchApp.searchs.entities
);

export const initialState = {
	entities: [],

	searchParams: {
		searchText: '',
		searchNum: '',
		terms: [],
		searchVolume: 'SUM', // 'SUM','SUMA', 'ALL'
		dateType: '',
		startDate: '',
		endDate: '',
		inventor: [],
		assignee: [],
		patentOffice: [],
		language: [],
		status: [],
		ipType: []
	},
	searchLoading: null,
	searchSubmit: null,
	selectedAppNo: null,
	cols: [
		{ header: '출원번호', accessor: '출원번호', width: 140, sortIndex: 0, colorize: false, visible: true },
		{ header: '출원일', accessor: '출원일자', width: 110, sortIndex: 1, colorize: false, visible: true },
		{ header: '상태', accessor: '등록사항', width: 80, sortIndex: 2, colorize: false, visible: true },
		{
			header: '국문명칭',
			accessor: '발명의명칭(국문)',
			width: 700,
			sortIndex: 3,
			colorize: false,
			visible: true
		},
		{
			header: '영문명칭',
			accessor: '발명의명칭(영문)',
			width: 700,
			sortIndex: 4,
			colorize: false,
			visible: false
		},
		{ header: '출원인', accessor: '출원인1', width: 250, sortIndex: 5, colorize: false, visible: true },
		{ header: '발명자', accessor: '발명자1', width: 150, sortIndex: 6, colorize: false, visible: true },
		{ header: 'IPC', accessor: 'ipc요약', width: 75, sortIndex: 7, colorize: false, visible: true }
	],
	analysisOptions: {
		tableOptions: {
			totalPosts: 0,
			pageIndex: 0,
			pageSize: 10
		},
		wordCloudOptions: {
			volume: '요약',
			unit: '구문', // '구문', '워드',
			output: 50
		},
		keywordsOptions: {
			keywordvec: '',
			modelType: 'word2vec', // 'word2vec','fasttext','etc'
			volume: '요약',
			unit: '구문', // '구문', '워드',
			output: 20
		},
		matrixOptions: {
			category: '연도별', // '국가별', '연도별', '기술별', '기업별'
			volume: '요약',
			unit: '구문', // '구문', '워드',
			output: 20
		}
	},
	selectedSearchIds: [],
	topicChips: [],
	news: [],
	newsSA: null,
	indicator: [],
	relatedCompany: [],
	matrix: {
		entities: [],
		// category: '연도별', // ['국가별', '연도별', '기술별', '기업별'],
		max: 0
	},
	matrixDialog: {
		props: {
			open: false
		},
		data: null
	},
	searchPageDialog: {
		props: {
			open: false
		}
	},
	wordCloud: [],
	keywords: {
		topic: [],
		vec: []
	}
};

const searchsSlice = createSlice({
	name: 'searchApp/searchs',
	initialState: searchsAdapter.getInitialState(initialState),
	reducers: {
		setMockData: (state, action) => {
			const { entities, searchParams, matrix, wordCloud, keywords, analysisOptions } = action.payload;

			state.entities = entities;
			state.searchParams = searchParams;
			state.analysisOptions = analysisOptions;
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
		setSelectedAppNo: (state, action) => {
			state.selectedAppNo = action.payload;
		},
		resetSelectedAppNo: (state, action) => {
			state.selectedAppNo = initialState;
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
		setTableOptions: (state, action) => {
			state.analysisOptions.tableOptions = action.payload;
		},
		setWordCloudOptions: (state, action) => {
			state.analysisOptions.wordCloudOptions = action.payload;
		},
		setKeywordsOptions: (state, action) => {
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
		openSearchPageDialog: (state, action) => {
			state.searchPageDialog.props.open = true;
		},
		closeSearchPageDialog: (state, action) => {
			state.searchPageDialog = initialState.searchPageDialog;
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
			// state.entities = action.payload.entities;
			// state.analysisOptions.tableOptions.dataCount = action.payload.dataCount;
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
	setSelectedAppNo,
	resetSelectedAppNo,
	setSearchParams,
	setSearchNum,
	setSearchVolume,
	setTableOptions,
	setWordCloudOptions,
	setKeywordsOptions,
	setMatrixOptions,
	setSearchSubmit,
	updateMatrixCategory,
	openMatrixDialog,
	closeMatrixDialog,
	openSearchPageDialog,
	closeSearchPageDialog,
	updateCols,
	resetCols,
	resetKeywordsVec
} = searchsSlice.actions;

export default searchsSlice.reducer;
