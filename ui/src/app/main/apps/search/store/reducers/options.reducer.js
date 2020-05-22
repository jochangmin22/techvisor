import * as Actions from "../actions";
import _ from "@lodash";

const initialState = {
    optionsClickAwayOpen: false,
    entities: null,
    searchText: "",
    noteDialogId: null,
    variateDescSize: true
};

const optionsReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_OPTIONS: {
            return {
                ...state,
                entities: _.keyBy(action.payload, "id")
            };
        }
        // case Actions.SET_SEARCH_TEXT: {
        //     return {
        //         ...state,
        //         searchText: action.searchText
        //     };
        // }
        case Actions.OPEN_OPTIONS_CLICK_AWAY: {
            return {
                ...state,
                optionsClickAwayOpen: true
            };
        }
        case Actions.CLOSE_OPTIONS_CLICK_AWAY: {
            return {
                ...state,
                optionsClickAwayOpen: false
            };
        }
        default: {
            return state;
        }
    }
};

export default optionsReducer;
