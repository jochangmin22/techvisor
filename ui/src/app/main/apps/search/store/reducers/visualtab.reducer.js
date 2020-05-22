import * as Actions from '../actions';

const initialState = {
	wordCloud: [],
	subjectRelation: [],
	// selectedVec: null,
	selectedIndex: null
};

const visualTabReducer = function(state = initialState, action) {
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
				subjectRelation: action.payload
			};
		}
		case Actions.CLEAR_WIDGETS_DATA: {
			return {
				...state,
				wordCloud: [],
				subjectRelation: []
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
		//         subjectRelation: []
		//     };
		// }
		case Actions.RESET_SUBJECT_RELATION_VEC: {
			return {
				...state,
				subjectRelation: {
					topic: action.topic // only vec reset
				}
			};
		}
		case Actions.UPDATE_SUBJECT_RELATION: {
			// return {
			//     ...state,
			//     subjectRelation: action.payload
			// };
			return {
				...state,
				subjectRelation: {
					...state.subjectRelation,
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
