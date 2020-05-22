import * as Actions from "../actions";
import _ from "@lodash";

const initialState = {
    entities: null,
    searchText: "",
    selectedSummaryIds: [],
    routeParams: {},
    summaryDialog: {
        type: "new",
        props: {
            open: false
        },
        data: null
    }
};

const summaryReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_SUMMARY: {
            return {
                ...state,
                entities: _.keyBy(action.payload, "id"),
                routeParams: action.routeParams
            };
        }
        case Actions.SET_SUMMARY: {
            return {
                ...state,
                entities: action.payload
            };
        }
        case Actions.SET_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.searchText
            };
        }
        case Actions.TOGGLE_IN_SELECTED_SUMMARY: {
            const summaryId = action.summaryId;

            let selectedSummaryIds = [...state.selectedSummaryIds];

            if (selectedSummaryIds.find(id => id === summaryId) !== undefined) {
                selectedSummaryIds = selectedSummaryIds.filter(
                    id => id !== summaryId
                );
            } else {
                selectedSummaryIds = [...selectedSummaryIds, summaryId];
            }

            return {
                ...state,
                selectedSummaryIds: selectedSummaryIds
            };
        }
        case Actions.SELECT_ALL_SUMMARY: {
            const arr = Object.keys(state.entities).map(k => state.entities[k]);

            const selectedSummaryIds = arr.map(summary => summary.id);

            return {
                ...state,
                selectedSummaryIds: selectedSummaryIds
            };
        }
        case Actions.DESELECT_ALL_SUMMARY: {
            return {
                ...state,
                selectedSummaryIds: []
            };
        }
        case Actions.OPEN_NEW_SUMMARY_DIALOG: {
            return {
                ...state,
                summaryDialog: {
                    type: "new",
                    props: {
                        open: true
                    },
                    data: null
                }
            };
        }
        case Actions.CLOSE_NEW_SUMMARY_DIALOG: {
            return {
                ...state,
                summaryDialog: {
                    type: "new",
                    props: {
                        open: false
                    },
                    data: null
                }
            };
        }
        case Actions.OPEN_EDIT_SUMMARY_DIALOG: {
            return {
                ...state,
                summaryDialog: {
                    type: "edit",
                    props: {
                        open: true
                    },
                    data: action.data
                }
            };
        }
        case Actions.CLOSE_EDIT_SUMMARY_DIALOG: {
            return {
                ...state,
                summaryDialog: {
                    type: "edit",
                    props: {
                        open: false
                    },
                    data: null
                }
            };
        }
        default: {
            return state;
        }
    }
};

export default summaryReducer;
