import { combineReducers } from 'redux';
import classify from './classify.reducer';
import user from './user.reducer';

const reducer = combineReducers({
	classify,
	user
});

export default reducer;
