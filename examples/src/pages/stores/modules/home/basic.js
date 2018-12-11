// import * as types from '@mutations/home';

const initialState = {
	list: [],
	value: 2
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
