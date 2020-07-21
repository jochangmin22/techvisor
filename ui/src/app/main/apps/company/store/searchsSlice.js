import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/company-app/searchs/`;
const NAME = 'companyApp/search/';

export const getSearchs = createAsyncThunk(NAME + 'getSearchs', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
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

export const getSearchsNum = createAsyncThunk(NAME + 'getSearchsNum', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'searchsnum', {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
});

export const getNews = createAsyncThunk(NAME + 'getNews', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'news', {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
});

export const getNewsSA = createAsyncThunk(NAME + 'getNewsSA', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'newssa', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const getRelatedCompany = createAsyncThunk(NAME + 'getRelatedCompany', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'relatedcompany', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const getMatrix = createAsyncThunk(NAME + 'getMatrix', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'matrix', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const getMatrixDialog = createAsyncThunk(NAME + 'getMatrixDialog', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'matrixdialog', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const getWordCloud = createAsyncThunk(NAME + 'getWordCloud', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'wordcloud', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const getSubjectRelation = createAsyncThunk(NAME + 'getSubjectRelation', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'vec', {
		params: routeParams
	});
	const data = await response.data;

	return { data, routeParams };
});

export const updateSubjectRelation = createAsyncThunk(
	NAME + 'updateSubjectRelation',
	async (routeParams, { getState }) => {
		routeParams = routeParams || getState().companyApp.search.routeParams;
		const response = await axios.get(URL + 'vec', {
			params: routeParams
		});
		const data = await response.data;

		return { data, routeParams };
	}
);

const searchsAdapter = createEntityAdapter({});

const initialState = {
	entities: [],
	searchParams: {
		searchText: '',
		searchNum: '',
		terms: [],
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
	searchScope: {
		searchVolume: '',
		wordCloudScope: {
			volume: '요약',
			unit: '구문', // '워드',
			output: 50
		}
	},
	searchLoading: null,
	searchSubmit: null,
	cols: ['1', '2', '3', '4', '5', '6', '7', '8'],
	clickedSearchId: null,
	selectedSearchIds: [],
	topicChips: [],
	news: [],
	newsSA: null,
	indicator: [],
	relatedCompany: [],
	matrix: {
		entities: [],
		category: '연도별', // ['국가별', '연도별', '기술별', '기업별'],
		max: 0
	},
	matrixDialog: {
		props: {
			open: false
		},
		data: null
	},
	wordCloud: [],
	subjectRelation: {
		topic: [],
		vec: [],
		modelType: 'word2vec' // ['word2vec','fasttext']
	}
};

const searchsSlice = createSlice({
	name: 'companyApp/searchs',
	initialState: searchsAdapter.getInitialState(initialState),
	reducers: {
		setMockData: (state, action) => {
			state.entities = action.entities;
			state.searchParams = action.searchParams;
			state.matrix = action.matrix;
			state.wordCloud = action.wordCloud;
			state.subjectRelation = action.subjectRelation;
		},
		clearSearchs: (state, action) => {
			state.entities = [];
			state.wordCloud = [];
			state.subjectRelation = [];
		},
		clearSearchText: (state, action) => {
			state = initialState;
		},
		setSearchLoading: (state, action) => {
			state.searchLoading = action.payload;
		},
		setClickedSearchId: (state, action) => {
			state.clickedSearchId = action.payload;
		},
		setSearchParams: (state, action) => {
			state.searchParams = action.payload;
		},
		setSearchNum: (state, action) => {
			state.searchParams.searchNum = action.payload;
		},
		setSearchVolume: (state, action) => {
			state.searchScope.searchVolume = action.payload;
		},
		setWordCloudScope: (state, action) => {
			state.searchScope.wordCloudScope = action.payload;
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
			state.matrixDialog.props.open = false;
			state.matrixDialog.data = false;
		},
		updateCols: (state, action) => {
			state.cols = action.payload;
		},
		resetSubjectRelationVec: (state, action) => {
			state.searchsubjectRelation.vec = [];
			state.searchsubjectRelation.topic = action.payload;
		},
		updateSubjectRelationModelType: (state, action) => {
			state.subjectRelation.modelType = action.payload;
		}
	},
	extraReducers: {
		[getSearchs.fulfilled]: (state, action) => {
			state.search = action.payload;
		},
		[getSearchsNum.fulfilled]: (state, action) => {
			state.quote = action.payload;
		},
		[getNews.fulfilled]: (state, action) => {
			state.family = action.payload;
		},
		[getNewsSA.fulfilled]: (state, action) => {
			state.ipcCpc = action.payload;
		},
		[getRelatedCompany.fulfilled]: (state, action) => {
			state.rnd = action.payload;
		},
		[getMatrix.fulfilled]: (state, action) => {
			state.legal = action.payload;
		},
		[getMatrixDialog.fulfilled]: (state, action) => {
			state.registerFee = action.payload;
		},
		[getWordCloud.fulfilled]: (state, action) => {
			state.rightfullOrder = action.payload;
		},
		[getSubjectRelation.fulfilled]: (state, action) => {
			state.rightHolder = action.payload;
		},
		[updateSubjectRelation.fulfilled]: (state, action) => {
			state.applicant = action.payload;
		}
	}
});

export const {
	setMockData,
	clearSearchs,
	clearSearchText,
	setSearchLoading,
	setClickedSearchId,
	setSearchParams,
	setSearchNum,
	setSearchVolume,
	setWordCloudScope,
	setSearchSubmit,
	updateMatrixCategory,
	openMatrixDialog,
	closeMatrixDialog,
	updateCols,
	resetSubjectRelationVec,
	updateSubjectRelationModelType
} = searchsSlice.actions;

export default searchsSlice.reducer;
