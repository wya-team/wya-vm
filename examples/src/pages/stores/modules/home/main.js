// import * as types from '@mutations/home';

const initialState = {
	data: ''
};

const mutations = {
	HOME_MAIN_GET_SUCCESS(state, { data, param }) {
		state.data = {
			...data
		};
	}
};

export const homeMain = {
	state: { ...initialState },
	mutations,
};
