import { combineReducers } from 'redux';
import searchs from './searchs.reducer';
import search from './search.reducer';
// import visualtab from './visualtab.reducer';

const reducer = combineReducers({
	searchs,
	search
	// visualtab
});

export default reducer;
