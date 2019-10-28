/**
 * 全部变量初始化及使用, 不要随意引用其他模块，保证_global是最高级别变量
 */
import { Device, Storage, Cookie } from '@wya/utils';

/**
 * 组件内遵守使用this.$global
 * 组件外等特殊场景使用_global
 */
typeof window === "object" ? window._global = {} : this._global = {};

// 版本号
_global.version = '1.5';

Storage.setVersion(_global.version);
Cookie.setVersion(_global.version);

// GUID
_global.GUID = location.host.split(".")[0];

// 程序打开时间
_global.landingTime = new Date();

/**
 * ios中微信支付的坑
 * 获取第一次加载的页面pathname值
 */
_global.landingPage = location.pathname;

/**
 * ios中微信分享的坑
 * 已修复，可以无视
 */
_global.landingSharePage = `${location.origin}${location.pathname}${location.search}`;

// 用户信息
_global.user = {};
_global.userType = '';
_global.auth = {};

// 环境
_global.env = process.env.NODE_ENV;

// 缩放比例
_global.scale = 1;

// 设备信息状态
_global.device = Device;

export default {
	install(Vue) {
		Vue.prototype.$global = _global;
		Vue.prototype.$auth = _global.auth;
	}
};
