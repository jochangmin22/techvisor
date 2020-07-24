import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/company-app/search/`;
const NAME = 'companyApp/search/';

export const getSearch = createAsyncThunk(NAME + 'getSearch', async params => {
	const response = await axios.get(URL, {
		params: params
	});
	const data = await response.data;

	return data;
});

export const getStock = createAsyncThunk(NAME + 'getStock', async params => {
	const response = await axios.post(URL + 'stock', params);
	const data = await response.data;

	return data;
});

export const getCompanyInfo = createAsyncThunk(NAME + 'getCompanyInfo', async (params, { dispatch }) => {
	const response = await axios.post(URL + 'companyinfo', params);
	const data = await response.data;

	const { stock_code } = data;
	if (stock_code) {
		dispatch(getStock({ kiscode: stock_code }));
	}

	return data;
});

const companyAdapter = createEntityAdapter({});

const initialState = {
	search: null,
	stock: {
		entities: [],
		chartType: 'year'
	},
	companyInfo: []
};

const searchSlice = createSlice({
	name: 'companyApp/search',
	initialState: companyAdapter.getInitialState(initialState),
	reducers: {
		resetSearch: (state, action) => initialState,
		clearStock: (state, action) => {
			state.stock = initialState.stock;
		},
		setChartType: (state, action) => {
			state.stock.chartType = action.payload;
		}
	},
	extraReducers: {
		[getSearch.fulfilled]: (state, action) => {
			state.search = action.payload;
		},
		[getStock.fulfilled]: (state, action) => {
			state.stock.entities = action.payload;
		},
		[getCompanyInfo.fulfilled]: (state, action) => {
			state.companyInfo = action.payload;
		}
	}
});

export const { resetSearch, clearStock, setChartType } = searchSlice.actions;

export default searchSlice.reducer;
