import axios from "axios";

export const GET_OPTIONS = "[SEARCH APP] GET OPTIONS";
export const SET_SEARCH_TEXT = "[SEARCH APP] SET SEARCH TEXT";
export const OPEN_OPTIONS_CLICK_AWAY = "[SEARCH APP] OPEN OPTIONS CLICK AWAY";
export const CLOSE_OPTIONS_CLICK_AWAY = "[SEARCH APP] CLOSE OPTIONS CLICK AWAY";

export function getOptions() {
    const request = axios.get("/api/notes-app/notes");

    return dispatch =>
        request.then(response =>
            dispatch({
                type: GET_OPTIONS,
                payload: response.data
            })
        );
}

// export function setSearchText(event) {
//     return {
//         type: SET_SEARCH_TEXT,
//         searchText: event.target.value
//     };
// }

export function resetSearchText() {
    return {
        type: SET_SEARCH_TEXT,
        searchText: ""
    };
}

export function toggleOptionsClickAway(value) {
    return {
        type: value ? CLOSE_OPTIONS_CLICK_AWAY : OPEN_OPTIONS_CLICK_AWAY
    };
}

// export function openOptionsClickAway(id) {
//     return {
//         type: OPEN_OPTIONS_CLICK_AWAY,
//         payload: id
//     };
// }

// export function closeOptionsClickAway() {
//     return {
//         type: CLOSE_OPTIONS_CLICK_AWAY
//     };
// }
