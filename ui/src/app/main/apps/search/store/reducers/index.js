import { combineReducers } from 'redux';
// import thsrs from "./thsrs.reducer";
// import options from "./options.reducer";
// import widgets from "./widgets.reducer";
import searchs from './searchs.reducer';
import search from './search.reducer';
// import resulttable from "./resulttable.reducer";
// import applicant from "./applicant.reducer";
// import visualtab from "./visualtab.reducer";

const reducer = combineReducers({
	// thsrs,
	// options,
	// widgets,
	searchs,
	search
	// resulttable,
	// applicant,
	// visualtab
});

export default reducer;
