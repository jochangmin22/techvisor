import _ from '@lodash';
import * as Actions from '../actions';

const initialState = {
	entities: null,
	searchText: '',
	selectedClassifyIds: [],
	routeParams: {},
	classifyDialog: {
		type: 'new',
		props: {
			open: false
		},
		data: null,
		selectedDictionary: null,
		categories: [],
		dictionaries: []
	}
};

const classifyReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_CLASSIFY: {
			return {
				...state,
				entities: _.keyBy(action.payload, 'id'),
				routeParams: action.routeParams
			};
		}
		case Actions.SET_CLASSIFY: {
			return {
				...state,
				entities: action.payload
			};
		}
		case Actions.GET_CATEGORY: {
			return {
				...state,
				classifyDialog: {
					...state.classifyDialog,
					categories: action.payload
				}
			};
		}
		case Actions.SET_SELECTED_DICTIONARY: {
			return {
				...state,
				classifyDialog: {
					...state.classifyDialog,
					selectedDictionary: action.payload
				}
			};
		}
		case Actions.GET_DICTIONARY: {
			return {
				...state,
				classifyDialog: {
					...state.classifyDialog,
					dictionaries: action.payload
				}
			};
		}
		case Actions.SET_SEARCH_TEXT: {
			return {
				...state,
				searchText: action.searchText
			};
		}
		case Actions.TOGGLE_IN_SELECTED_CLASSIFY: {
			const { classifyId } = action;

			let selectedClassifyIds = [...state.selectedClassifyIds];

			if (selectedClassifyIds.find(id => id === classifyId) !== undefined) {
				selectedClassifyIds = selectedClassifyIds.filter(id => id !== classifyId);
			} else {
				selectedClassifyIds = [...selectedClassifyIds, classifyId];
			}

			return {
				...state,
				selectedClassifyIds
			};
		}
		case Actions.SELECT_ALL_CLASSIFY: {
			const arr = Object.keys(state.entities).map(k => state.entities[k]);

			const selectedClassifyIds = arr.map(classify => classify.id);

			return {
				...state,
				selectedClassifyIds
			};
		}
		case Actions.DESELECT_ALL_CLASSIFY: {
			return {
				...state,
				selectedClassifyIds: []
			};
		}
		case Actions.OPEN_NEW_CLASSIFY_DIALOG: {
			return {
				...state,
				classifyDialog: {
					type: 'new',
					props: {
						open: true
					},
					data: null
				}
			};
		}
		case Actions.CLOSE_NEW_CLASSIFY_DIALOG: {
			return {
				...state,
				classifyDialog: {
					type: 'new',
					props: {
						open: false
					},
					data: null
				}
			};
		}
		case Actions.OPEN_EDIT_CLASSIFY_DIALOG: {
			return {
				...state,
				classifyDialog: {
					type: 'edit',
					props: {
						open: true
					},
					data: action.data
				}
			};
		}
		case Actions.CLOSE_EDIT_CLASSIFY_DIALOG: {
			return {
				...state,
				classifyDialog: {
					type: 'edit',
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

export default classifyReducer;
