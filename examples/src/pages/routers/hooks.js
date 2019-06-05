import Vue from 'vue';
import { Storage } from '@utils/utils';
import { Vc } from '@wya/vc';
import { serviceManager } from '@stores/services/utils';
import { PRE_ROUTER_URL, TOKEN_KEY } from '../constants/constants';
/**
 * 是否已经登录
 */
const isLoggedIn = (nextState) => {
	return true;
};

export const beforeEach = ((to, from, next) => {
	next();
});
export const afterEach = (route => {
});


/**
 * 设置登录状态
 * 
 * @param {*} data 
 * @param {*} opts 
 */
let landPage = `${location.pathname}${location.search}`;
export const createLoginAuth = (data = {}, replace = true, opts = {}) => {

	_global.auth = data.auth || {};
	// 同步
	Vue.prototype.$global = _global;
	Vue.prototype.$auth = _global.auth;

	// todo	
	Storage.set(TOKEN_KEY, data);
	window.routesManager.reset();

	// 首页或者一开始记录的页面
	let path = landPage.replace(new RegExp(PRE_ROUTER_URL), '/');
	path = /^\/login/.test(path) ? '/' : path;
	
	window.app && window.app.$router.replace(path);
};

/**
 * 清除登录状态
 * @param {*} opts 
 */
export const clearLoginAuth = (opts = {}) => {
	// 同步
	Vue.prototype.$global = _global;
	Vue.prototype.$auth = _global.auth;

	Vc.instance.clearAll();
	Storage.remove(TOKEN_KEY);
	serviceManager.clear();

	// 重置页面
	landPage = `/`;
	// 无权限页面
	window.app && window.app.$router.replace('/login');

};

/**
 * 清除之前所有版本的缓存
 */
export const clearLocalStorage = (version) => {
	let keys = Object.keys(localStorage);
	for (let i = 0; i < keys.length; i++) {
		// @wya/vc 为vc组件库缓存，不清除
		if (!keys[i].includes(version) && !keys[i].includes('@wya/vc')) {
			Storage.remove(keys[i]); 
		}
	}
};