import Vue from 'vue';
import { getItem, setItem, delItem } from '@utils/utils';

/**
 * 是否已经登录
 */
const isLoggedIn = (nextState) => {
	let state = false; // 未登录
	let user = getItem(`user_${_global.version}`);
	if (user) {
		state = true;
	}
	return true;
	// return state;
};

export const beforeEach = ((to, from, next) => {
	if (isLoggedIn() || to.path === '/login') {
		next();
		return;
	}
	next('/login');
});

export const afterEach = (route => {
});
