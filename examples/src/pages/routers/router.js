import '@babel/polyfill';

/**
 * Vue
 */
import Vue from 'vue';
import Router from 'vue-router';
import Vuex from 'vuex';
import { Vc } from '@wya/vc';
import { sync } from 'vuex-router-sync';

/**
 * 全局变量 _global, 不要动
 */
import _global from './_global'; // eslint-disable-line

/**
 * 配置
 */
import SetTitle from '@components/set-title/set-title';
import emitter from '@extends/mixins/emitter';
import request from '@extends/plugins/request';
import VcConfig from './vc.config';

import { beforeEach, afterEach, clearLocalStorage } from './hooks';

/**
 * Vuex Config
 */
import { storeConfig } from '../stores/root';

import RoutesManager from './routes.dynamic';
import { PRE_ROUTER_URL } from '../constants/constants';
/**
 * vue-router Config
 */
let dynamicRoutes;
if (process.env.NODE_ENV !== "production") {
	dynamicRoutes = require('./routes.dev').dynamicRoutes;
} else {
	dynamicRoutes = require('./routes.dist').dynamicRoutes;
}
let basicRoutes;
if (process.env.NODE_ENV !== "production") {
	basicRoutes = require('./routes.dev').basicRoutes;
} else {
	basicRoutes = require('./routes.dist').basicRoutes;
}

let routesManager = new RoutesManager(basicRoutes, dynamicRoutes);

Vue.config.productionTip = false;

// - 全局组件
Vue.component(SetTitle.name, SetTitle);

// - 全局mixins
Vue.mixin(emitter);

// - 全局plugins
Vue.use(request);

// - 全局global对象
Vue.use(_global);

// - 路由
Vue.use(Router);
const router = new Router(routesManager.config);

routesManager.setRouter(router);

router.beforeEach(beforeEach);
router.afterEach(afterEach);
router.onError((error) => {
	if (error.message.match(/Loading chunk (\d)+ failed/g)) {
		location.reload();
	}
});

// - Vuex
Vue.use(Vuex);
const store = new Vuex.Store(storeConfig);

// - 全局@wya/vc实例
Vue.use(Vc, VcConfig({ store, router }));

// - 同步
sync(store, router);

// - 实例
const app = new Vue({
	el: "#pages",
	router,
	store,
	render(h) {
		return (
			<div id="pages">
				<router-view></router-view>
			</div>
		);
	}
});

// 先不考虑服务端渲染情况
// 先不考虑服务端渲染情况
router.onReady(() => {
	app.$mount('#pages');
	const { redirect } = sessionStorage;
	delete sessionStorage.redirect;

	// github pages hack
	const curUrl = `${location.pathname}${location.search}${location.hash}`;
	if (redirect && redirect.includes(PRE_ROUTER_URL) && redirect != curUrl) {
		try {
			router.push(redirect.replace(PRE_ROUTER_URL, '/'));
		} catch (e) {
			location.href = redirect;
		}
	}
});

window.app = app;
window.routesManager = routesManager;
