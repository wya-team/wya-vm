import { Socket } from '@wya/socket';
import { Message } from '@wya/vc';
import { URL_WEBSOCKET } from '@constants/constants';
import { isEqualWith } from 'lodash';
import { Storage, RegEx } from '@utils/utils';
import API_ROOT from '@stores/apis/root';

export const serviceObj = {
	param: {},
	res: undefined
};

export const serviceCompare = (newParam, localObj) => {
	return isEqualWith(newParam, localObj.param)
		? localObj.res
		: undefined;
};

export const serviceManager = {
	cbs: [],
	add(cb) {
		this.cbs.push(cb);
	},
	clear() {
		this.cbs.forEach(cb => cb());
		this.cbs = [];
	}
};

export const createService = (defaultOptions = {}) => {
	const {
		key,
		url,
		parser = null,
		cache = false,
		vuex = false,
		param: defaultParam = {},
		getParam = (instance) => ({}),
	} = defaultOptions;
	let store;
	cache && (store = Storage.get(`${key}`));
	store = store || { ...serviceObj };

	// clear
	!cache && serviceManager.add(() => {
		store = { ...serviceObj };
	});


	return {
		[key]: (userOptions = {}) => {
			const { param: userParam = {} } = userOptions;
			const options = { ...defaultOptions, ...userOptions };
			const { autoLoad = true, autoClear = false } = options;
			// 方法首字母大写
			const strFn = key.charAt(0).toUpperCase() + key.slice(1);

			const loadKey = `load${strFn}`;
			const clearKey = `clear${strFn}`;
			const loadingKey = `loading${strFn}`;

			return {
				data() {
					return {
						[key]: (store.res || {}).data || [],
						[loadingKey]: false
					};
				},
				created() {
					autoLoad && (this[loadKey])({
						...defaultParam,
						...userParam,
						...getParam(this)
					});
				},
				beforeDestroy() {
					autoClear && this[clearKey]();
				},
				methods: {
					[loadKey](param, opts = {}) { // eslint-disable-line
						this[loadingKey] = true;
						let ajax = vuex ? this.request : this.$request;
						return ajax({
							url, // 必须是mutationType
							type: 'GET',
							localData: serviceCompare(param, store),
							loading: false,
							param,
							...opts
						}).then((res) => {
							store = {
								param,
								res
							};
							this[key] = parser ? parser(store.res.data) : store.res.data;
							cache && Storage.set(`${key}`, store);
							return res;
						}).catch((res) => {
							Message.error(res.msg);
							return Promise.reject(res);
						}).finally(() => {
							this[loadingKey] = false;
						});
					},
					[clearKey]() {
						store = { ...serviceObj };
					}
				}
			};
		}
	};
};

/**
 * 创建socket
 * @param {*} defaultOptions
 */
export const createSocket = (defaultOptions = {}) => {
	const {
		key,
		url = URL_WEBSOCKET,
		bindUrl,
		param = {},
		getParam = (instance) => ({}),
		getConnect = (v, instance) => v,
		isNeedDestroy = true,
		parser
	} = defaultOptions;

	let socket;
	// clear
	serviceManager.add(() => {
		socket && socket.close();
		socket = undefined;
	});

	return {
		[key]: (userOptions = {}) => {
			return {
				data() {
					return {};
				},
				created() {
					this[key] = socket || this.initWebSocket();
				},
				methods: {
					initWebSocket() {
						socket = new Socket({ parser });
						socket.connect(getConnect(RegEx.URLScheme.test(url) ? url : API_ROOT[url], this));
						// 链接成功后获取client_id
						bindUrl && socket.on('connect', (res) => {
							const { data = {} } = res.data || {};
							this.$request({
								url: bindUrl,
								type: 'GET',
								param: {
									...data,
									...param,
									...getParam(this)
								},
							}).then((res) => { // eslint-disable-line
								// todo
							}).catch((error) => {
								Message.error(error.msg);
							});
							// 绑定id，后端要求
						});
						socket.on('error', (res) => {
							Message.error('服务器连接失败,请刷新页面');
						});

						// 存储
						return socket;
					}
				},
				beforeDestroy() {
					isNeedDestroy && socket && socket.close();
					isNeedDestroy && (socket = undefined);
				}
			};
		}
	};
};
