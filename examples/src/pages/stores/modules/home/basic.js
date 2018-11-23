// import * as types from '@mutations/home';

const initialState = {
	data: ''
};

const mutations = {
	HOME_BASIC_GET_SUCCESS(state, { data, param }) {
		state.data = {
			...data
		};
	}
};

export const homeBasic = {
	state: { ...initialState },
	mutations,
};
