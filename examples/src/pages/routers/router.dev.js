/**
 * dev 开发时使用
 */
import '@babel/polyfill';

/**
 * Vue
 */
import Vue from 'vue';
import Router from 'vue-router';
import Vuex from 'vuex';
import { Vc } from 'wya-vc';
import { sync } from 'vuex-router-sync';
import { locale } from 'iview';
import lang from 'iview/dist/locale/zh-CN';

// configure language
locale(lang);

/**
 * 配置
 */
import SetTitle from '@common/set-title/set-title';
import emitter from '@extends/mixins/emitter';
import request from '@extends/plugins/request';
import VcConfig from './vc.config';
import { PRE_ROUTER_URL } from '../constants/constants';

/**
 * 全局变量 _global
 */
import _global from './_global';

/**
 * vue-router Config
 */
import { routeConfig } from './routes';
import { beforeEach, afterEach } from './hooks';

/**
 * Vuex Config
 */
import { storeConfig } from '../stores/root';

Vue.config.productionTip = false;

// - 全局组件
Vue.component(SetTitle.name, SetTitle);

// - 全局mixins
Vue.mixin(emitter);

// - 全局plugins
Vue.use(request);

// - 全局global对象
Vue.use(_global);

// - 全局wya-vc实例
Vue.use(Vc, VcConfig);

// - 路由
Vue.use(Router);
const router = new Router(routeConfig);
router.beforeEach(beforeEach);
router.afterEach(afterEach);

// - Vuex
Vue.use(Vuex);
const store = new Vuex.Store(storeConfig);

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
