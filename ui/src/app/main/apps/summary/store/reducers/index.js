import { combineReducers } from "redux";
import summary from "./summary.reducer";
import user from "./user.reducer";

const reducer = combineReducers({
    summary,
    user
});

export default reducer;
