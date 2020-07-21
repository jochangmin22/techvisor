import { combineReducers } from '@reduxjs/toolkit';
import search from './searchSlice';
import searchs from './searchsSlice';
// import user from './userSlice';

const reducer = combineReducers({
	search,
	searchs,
	// user
});

export default reducer;
