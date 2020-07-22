import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/search-app/searchs/`;
const NAME = 'searchApp/search/';

export const getSearchs = createAsyncThunk(NAME + 'getSearchs', async (params, subParams) => {
	const response = await axios.get(URL, { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getSearchsNum = createAsyncThunk(NAME + 'getSearchsNum', async params => {
	const response = await axios.get(URL + 'searchsnum', { params });
	const data = await response.data;

	return data;
});

export const getNews = createAsyncThunk(NAME + 'getNews', async params => {
	const response = await axios.get(URL + 'news', { params });
	const data = await response.data;

	return data;
});

export const getNewsSA = createAsyncThunk(NAME + 'getNewsSA', async params => {
	const response = await axios.get(URL + 'newssa', { params });
	const data = await response.data;

	return data;
});

export const getRelatedCompany = createAsyncThunk(NAME + 'getRelatedCompany', async params => {
	const response = await axios.get(URL + 'relatedcompany', { params });
	const data = await response.data;

	return data;
});
export const getMatrix = createAsyncThunk(NAME + 'getMatrix', async (params, subParams) => {
	const response = await axios.get(URL + 'matrix', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const getMatrixDialog = createAsyncThunk(NAME + 'getMatrixDialog', async params => {
	const response = await axios.get(URL + 'matrixdialog', { params });
	const data = await response.data;

	return data;
});

export const getWordCloud = createAsyncThunk(NAME + 'getWordCloud', async params => {
	const response = await axios.get(URL + 'wordcloud', { params });
	const data = await response.data;

	return data;
});

export const getSubjectRelation = createAsyncThunk(NAME + 'getSubjectRelation', async (params, subParams) => {
	const response = await axios.get(URL + 'vec', { params: params, subParams: subParams });
	const data = await response.data;

	return data;
});

export const updateSubjectRelation = createAsyncThunk(NAME + 'updateSubjectRelation', async (params, subParams) => {
	const response = await axios.get(URL + 'vec', { params: params, subParams: subParams });
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
		keywordvec: '',
		modelType: 'word2vec' // ['word2vec','fasttext']
	}
};

const searchsSlice = createSlice({
	name: 'searchApp/searchs',
	initialState: searchsAdapter.getInitialState(initialState),
	reducers: {
		setMockData: (state, action) => {
			const { entities, searchParams, matrix, wordCloud, subjectRelation } = action.payload;

			state.entities = entities;
			state.searchParams = searchParams;
			state.matrix = matrix;
			state.wordCloud = wordCloud;
			state.subjectRelation = subjectRelation;
		},
		clearSearchs: (state, action) => {
			const { entities, wordCloud, subjectRelation } = initialState;

			state.entities = entities;
			state.wordCloud = wordCloud;
			state.subjectRelation = subjectRelation;
		},
		clearSearchText: (state, action) => initialState,

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
			state.matrixDialog = initialState.matrixDialog;
		},
		updateCols: (state, action) => {
			state.cols = action.payload;
		},
		resetSubjectRelationVec: (state, action) => {
			// state.subjectRelation = { ...state.subjectRelation, vec: [], topic: action.payload };
			state.subjectRelation.vec = initialState.subjectRelation.vec;
		},
		updateSubjectRelationModelType: (state, action) => {
			state.subjectRelation.modelType = action.payload;
		}
	},
	extraReducers: {
		[getSearchs.fulfilled]: (state, action) => {
			state.entities = action.payload;
		},
		[getSearchsNum.fulfilled]: (state, action) => {
			state.searchNum = action.payload;
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
		[getSubjectRelation.fulfilled]: (state, action) => {
			state.subjectRelation = action.payload;
		},
		// [updateSubjectRelation.pending]: (state, action) => {
		// 	resetSubjectRelationVec();
		// },
		[updateSubjectRelation.fulfilled]: (state, action) => {
			state.subjectRelation = { ...state.subjectRelation, vec: action.payload.vec };
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
