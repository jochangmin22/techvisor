import { combineReducers } from '@reduxjs/toolkit';
import summary from './summarySlice';

const reducer = combineReducers({
	summary
});

export default reducer;
