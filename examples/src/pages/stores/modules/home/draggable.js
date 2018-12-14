const initialState = {
	data: ''
};

const mutations = {
	HOME_DRAGGABLE_GET_SUCCESS(state, { data, param }) {
		state.data = {
			...data
		};
	}
};

export const homeDraggable = {
	state: { ...initialState },
	mutations,
};
