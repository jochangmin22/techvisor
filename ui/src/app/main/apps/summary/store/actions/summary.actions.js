import axios from "axios";
import { getUserData } from "app/main/apps/summary/store/actions/user.actions";

export const GET_SUMMARY = "[SUMMARY APP] GET SUMMARY";
export const SET_SUMMARY = "[SUMMARY APP] SET SUMMARY";
export const SET_SEARCH_TEXT = "[SUMMARY APP] SET SEARCH TEXT";
export const TOGGLE_IN_SELECTED_SUMMARY =
    "[SUMMARY APP] TOGGLE IN SELECTED SUMMARY";
export const SELECT_ALL_SUMMARY = "[SUMMARY APP] SELECT ALL SUMMARY";
export const DESELECT_ALL_SUMMARY = "[SUMMARY APP] DESELECT ALL SUMMARY";
export const OPEN_NEW_SUMMARY_DIALOG = "[SUMMARY APP] OPEN NEW SUMMARY DIALOG";
export const CLOSE_NEW_SUMMARY_DIALOG =
    "[SUMMARY APP] CLOSE NEW SUMMARY DIALOG";
export const OPEN_EDIT_SUMMARY_DIALOG =
    "[SUMMARY APP] OPEN EDIT SUMMARY DIALOG";
export const CLOSE_EDIT_SUMMARY_DIALOG =
    "[SUMMARY APP] CLOSE EDIT SUMMARY DIALOG";
export const ADD_SUMMARY = "[SUMMARY APP] ADD SUMMARY";
export const UPDATE_SUMMARY = "[SUMMARY APP] UPDATE SUMMARY";
export const REMOVE_SUMMARY = "[SUMMARY APP] REMOVE SUMMARY";
export const REMOVE_SUMMARYS = "[SUMMARY APP] REMOVE SUMMARYS";
export const TOGGLE_STARRED_SUMMARY = "[SUMMARY APP] TOGGLE STARRED SUMMARY";
export const TOGGLE_STARRED_SUMMARYS = "[SUMMARY APP] TOGGLE STARRED SUMMARYS";
export const SET_SUMMARY_STARRED = "[SUMMARY APP] SET SUMMARY STARRED ";

export function getSummary(routeParams) {
    const request = axios.get("/api/summary-app/summary", {
        params: routeParams
    });

    return dispatch =>
        request.then(response =>
            dispatch({
                type: GET_SUMMARY,
                payload: response.data,
                routeParams
            })
        );
}

export function setSummary(data) {
    return {
        type: SET_SUMMARY,
        payload: data
    };
}

export function setSearchText(event) {
    return {
        type: SET_SEARCH_TEXT,
        searchText: event.target.value
    };
}

export function toggleInSelectedSummary(summaryId) {
    return {
        type: TOGGLE_IN_SELECTED_SUMMARY,
        summaryId
    };
}

export function selectAllSummary() {
    return {
        type: SELECT_ALL_SUMMARY
    };
}

export function deSelectAllSummary() {
    return {
        type: DESELECT_ALL_SUMMARY
    };
}

export function openNewSummaryDialog() {
    return {
        type: OPEN_NEW_SUMMARY_DIALOG
    };
}

export function closeNewSummaryDialog() {
    return {
        type: CLOSE_NEW_SUMMARY_DIALOG
    };
}

export function openEditSummaryDialog(data) {
    return {
        type: OPEN_EDIT_SUMMARY_DIALOG,
        data
    };
}

export function closeEditSummaryDialog() {
    return {
        type: CLOSE_EDIT_SUMMARY_DIALOG
    };
}

export function addSummary(newSummary) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/add-summary", {
            newSummary
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: ADD_SUMMARY
                })
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function updateSummary(summary) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/update-summary", {
            summary
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: UPDATE_SUMMARY
                })
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function removeSummary(summaryId) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/remove-summary", {
            summaryId
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: REMOVE_SUMMARY
                })
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function removeSummarys(summaryIds) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/remove-summary", {
            summaryIds
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: REMOVE_SUMMARY
                }),
                dispatch({
                    type: DESELECT_ALL_SUMMARY
                })
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function toggleStarredSummary(summaryId) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/toggle-starred-summary", {
            summaryId
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: TOGGLE_STARRED_SUMMARY
                }),
                dispatch(getUserData())
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function toggleStarredSummarys(summaryIds) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/toggle-starred-summary", {
            summaryIds
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: TOGGLE_STARRED_SUMMARY
                }),
                dispatch({
                    type: DESELECT_ALL_SUMMARY
                }),
                dispatch(getUserData())
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function setSummaryStarred(summaryIds) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/set-summary-starred", {
            summaryIds
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: SET_SUMMARY_STARRED
                }),
                dispatch({
                    type: DESELECT_ALL_SUMMARY
                }),
                dispatch(getUserData())
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}

export function setSummaryUnstarred(summaryIds) {
    return (dispatch, getState) => {
        const { routeParams } = getState().summaryApp.summary;

        const request = axios.post("/api/summary-app/set-summary-unstarred", {
            summaryIds
        });

        return request.then(response =>
            Promise.all([
                dispatch({
                    type: SET_SUMMARY_STARRED
                }),
                dispatch({
                    type: DESELECT_ALL_SUMMARY
                }),
                dispatch(getUserData())
            ]).then(() => dispatch(getSummary(routeParams)))
        );
    };
}
