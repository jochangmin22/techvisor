import * as Actions from "../actions";
// import _ from "@lodash";

const initialState = {
    data: {},
    thsrsClickAwayOpen: false
};

const thsrsReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_THSRS: {
            return {
                ...state,
                // entities: _.keyBy(action.payload, "id")
                data: action.payload
            };
        }
        case Actions.UPDATE_THSRS: {
            return {
                ...state,
                // entities: _.keyBy(action.payload, "id")
                data: action.payload
            };
        }
        case Actions.OPEN_THSRS_CLICK_AWAY: {
            return {
                ...state,
                thsrsClickAwayOpen: true
            };
        }
        case Actions.CLOSE_THSRS_CLICK_AWAY: {
            return {
                // ...state,
                data: {},
                thsrsClickAwayOpen: false
            };
        }
        default: {
            return state;
        }
    }
};

export default thsrsReducer;
