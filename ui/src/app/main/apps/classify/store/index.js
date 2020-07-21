import { combineReducers } from '@reduxjs/toolkit';
import classify from './classifySlice';

const reducer = combineReducers({
	classify
});

export default reducer;
