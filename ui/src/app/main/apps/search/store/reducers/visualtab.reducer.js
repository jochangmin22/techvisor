import * as Actions from '../actions';

const initialState = {
	wordCloud: [],
	keywords: [],
	// selectedVec: null,
	selectedIndex: null
};

const visualTabReducer = function (state = initialState, action) {
	switch (action.type) {
		case Actions.GET_WORDCLOUD: {
			return {
				...state,
				wordCloud: action.payload
			};
		}
		case Actions.GET_SUBJECT_RELATION: {
			return {
				...state,
				keywords: action.payload
			};
		}
		case Actions.CLEAR_WIDGETS_DATA: {
			return {
				...state,
				wordCloud: [],
				keywords: []
			};
		}
		// case Actions.RESET_WORDCLOUD: {
		//     return {
		//         ...state,
		//         wordCloud: []
		//     };
		// }
		// case Actions.RESET_SUBJECT_RELATION: {
		//     return {
		//         ...state,
		//         keywords: []
		//     };
		// }
		case Actions.RESET_SUBJECT_RELATION_VEC: {
			return {
				...state,
				keywords: {
					topic: action.topic // only vec reset
				}
			};
		}
		case Actions.UPDATE_SUBJECT_RELATION: {
			// return {
			//     ...state,
			//     keywords: action.payload
			// };
			return {
				...state,
				keywords: {
					...state.keywords,
					vec: action.payload
				}
			};
		}
		// case Actions.UPDATE_SUBJECT_RELATION_VEC: {
		//     return {
		//         ...state,
		//         selectedVec: action.selectedVec
		//     };
		// }
		case Actions.SAVE_VISUALTAB: {
			return {
				...action.payload
			};
		}
		case Actions.SET_SELECTED_INDEX: {
			return {
				...state,
				selectedIndex: action.selectedIndex
			};
		}
		default: {
			return state;
		}
	}
};

export default visualTabReducer;
