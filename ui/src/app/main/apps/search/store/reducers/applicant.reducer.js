import * as Actions from "../actions";
// import _ from "@lodash";

const initialState = {
    entities: [],
    // data: [],
    searchText: "",
    applicantClickAwayOpen: false,
    selectedApplicantIds: []
    // routeParams: {}
};

const applicantReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_APPLICANT_TABLE: {
            return {
                ...state,
                // data: action.payload,
                entities: action.payload,
                // entities: _.keyBy(action.payload, "출원인대표명"),
                //data: _.keyBy(action.payload, "출원인명")
                // routeParams: action.routeParams
                searchText: action.searchText
            };
        }
        case Actions.UPDATE_APPLICANT_TABLE: {
            return {
                ...state,
                // entities: _.keyBy(action.payload, "id")
                entities: action.payload
            };
        }
        // case Actions.UPDATE_APPLICANT_SEARCH_TEXT: {
        //     return {
        //         ...state,
        //         searchText: action.searchText
        //     };
        // }
        case Actions.SET_APPLICANT_TABLE_SEARCH_TEXT: {
            return {
                ...state,
                searchText: action.searchText
            };
        }
        case Actions.OPEN_APPLICANT_CLICK_AWAY: {
            return {
                ...state,
                applicantClickAwayOpen: true
            };
        }
        case Actions.CLOSE_APPLICANT_CLICK_AWAY: {
            return {
                ...state,
                entities: {},
                applicantClickAwayOpen: false
            };
        }
        case Actions.TOGGLE_IN_SELECTED_APPLICANTS: {
            const applicantId = action.applicantId;

            let selectedApplicantIds = [...state.selectedApplicantIds];

            // if (
            //     selectedApplicantIds.find(id => id === applicantId) !==
            //     undefined
            // ) {
            //     selectedApplicantIds = selectedApplicantIds.filter(
            //         id => id !== applicantId
            //     );
            if (
                selectedApplicantIds.find(
                    특허고객번호 => 특허고객번호 === applicantId
                ) !== undefined
            ) {
                selectedApplicantIds = selectedApplicantIds.filter(
                    특허고객번호 => 특허고객번호 !== applicantId
                );
            } else {
                selectedApplicantIds = [...selectedApplicantIds, applicantId];
            }

            return {
                ...state,
                selectedApplicantIds: selectedApplicantIds
            };
        }
        case Actions.SELECT_ALL_APPLICANTS: {
            const arr = Object.keys(state.entities).map(k => state.entities[k]);
            // const selectedApplicantIds = arr.map(applicant => applicant.id);
            const selectedApplicantIds = arr.map(
                applicant => applicant.특허고객번호
            );

            return {
                ...state,
                selectedApplicantIds: selectedApplicantIds
            };
        }
        case Actions.DESELECT_ALL_APPLICANTS: {
            return {
                ...state,
                selectedApplicantIds: []
            };
        }
        default: {
            return state;
        }
    }
};

export default applicantReducer;
