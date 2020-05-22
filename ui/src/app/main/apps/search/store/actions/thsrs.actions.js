import axios from "axios";

export const GET_THSRS = "[SEARCH APP] GET THSRS FROM API";
export const SET_THSRS_SEARCH_TEXT = "[SEARCH APP] SET THSRS TO SEARCH TEXT";

export const OPEN_THSRS_CLICK_AWAY = "[SEARCH APP] OPEN THSRS CLICK AWAY";
export const CLOSE_THSRS_CLICK_AWAY = "[SEARCH APP] CLOSE THSRS CLICK AWAY";
export const UPDATE_THSRS = "[SEARCH APP] UPDATE THSRS TO SEARCHTEXT";

export function getThsrs(params) {
    // const request = axios.post("/api/search-app/update-thsrs", {
    //     thsrs: Object.values(thsrs)
    // });

    // return dispatch =>
    //     request.then(response =>
    //         dispatch({
    //             type: UPDATE_THSRS,
    //             payload: response.data
    //         })
    //     );
    const request = axios({
        method: "get",
        // headers: { "Access-Control-Allow-Origin": true },
        // url: "http://192.168.0.36:9000/api/thsrs/",
        // url: `http://127.0.0.1:8000/api/search-app/thsrs/${params}`
        url: "/api/search-app/thsrs"
    });
    return dispatch =>
        request.then(response =>
            dispatch({
                type: UPDATE_THSRS,
                payload: response.data
            })
        );
}

export function setThsrsSearchText(event) {
    return {
        type: SET_THSRS_SEARCH_TEXT,
        searchText: event.target.value
    };
}

export function updateThsrs(params) {
    // const request = axios.post("/api/search-app/update-thsrs", {
    //     thsrs: Object.values(thsrs)
    // });

    // return dispatch =>
    //     request.then(response =>
    //         dispatch({
    //             type: UPDATE_THSRS,
    //             payload: response.data
    //         })
    //     );
    const request = axios({
        method: "get",
        // headers: { "Access-Control-Allow-Origin": true },
        // url: "http://192.168.0.36:9000/api/thsrs/",
        // url: `http://127.0.0.1:8000/api/search-app/thsrs/${params}`
        url: "/api/search-app/thsrs"
    });
    return dispatch =>
        request.then(response =>
            dispatch({
                type: UPDATE_THSRS,
                payload: response.data
            })
        );
}

export function toggleThsrsClickAway(value) {
    return {
        type: value ? CLOSE_THSRS_CLICK_AWAY : OPEN_THSRS_CLICK_AWAY
    };
}

// export function openThsrsDialog() {
//     return {
//         type: THSRS_DIALOG_OPEN
//     };
// }

// export function closeThsrsDialog() {
//     return {
//         type: THSRS_DIALOG_CLOSE
//     };
// }
