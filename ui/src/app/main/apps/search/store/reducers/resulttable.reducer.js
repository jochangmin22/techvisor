import * as Actions from "../actions";

const initialState = {
    entities: [],
    // data: [],
    searchText: "",
    selectedSearchIds: []
};

const resultTableReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_RESULTS_TABLE: {
            return {
                ...state,
                // data: action.payload
                entities: action.payload,
                searchText: action.searchText
            };
        }
        case Actions.SET_RESULTS_TABLE_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.searchText
            };
        }
        default: {
            return state;
        }
    }
};

export default resultTableReducer;
