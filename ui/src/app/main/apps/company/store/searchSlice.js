import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import axios from 'axios';

const URL = `${process.env.REACT_APP_API_URL}/api/company-app/search/`;
const NAME = 'companyApp/search/';

export const getSearch = createAsyncThunk(NAME + 'getSearch', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL, {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
});

export const getStock = createAsyncThunk(NAME + 'getStock', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'stock', {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
});

export const getCompanyInfo = createAsyncThunk(NAME + 'getCompanyInfo', async (routeParams, { getState }) => {
	routeParams = routeParams || getState().companyApp.search.routeParams;
	const response = await axios.get(URL + 'companyinfo', {
		params: routeParams
	});
	const data = await response.data;

	return {
		data,
		routeParams
	};
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

const companySlice = createSlice({
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

export const { resetSearch, clearStock, setChartType } = companySlice.actions;

export default companySlice.reducer;
