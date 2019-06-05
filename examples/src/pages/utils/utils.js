// -- 微一案工具库 --
export * from '@wya/utils';

import { RegEx, Storage, Cookie } from '@wya/utils';

// -- end --
/**
 * 改写@wya/utils里表单验证的正则
 */
RegEx.set({
	URLScheme: {
		value: /[a-zA-z]+:\/\/[^\s]*/,
		msg: "请填写正确网页地址协议"
	},
	letterAndNumber: {
		value: /^[A-Za-z0-9]{1,}$/,
		msg: "请不要输入特殊字符"
	},
	phone: {
		value: /^0[1-9][0-9]{1,2}-[2-8][0-9]{6,7}$/,
		msg: "请填写正确的电话号码"
	}
});

// -- 业务相关 --

export const initSelect = (res, value, label, children, level = 1) => {
	let __arr = [];
	const __child = [];
	if (res instanceof Array && level > 0) {
		for (let j = 0; j < res.length; j++) {
			__arr = [...__arr, {
				value: res[j][value] || j,
				label: res[j][label] || res[j],
				children: initSelect(res[j][children], value, label, children, level - 1)
			}];
		}
		return __arr;
	}
	return level == 0 ? undefined : [];
};
/**
 *
 */
export const initTreeData = (obj, value, label, children) => {
	if (typeof obj === 'object') {
		return JSON.parse(
			JSON.stringify(obj)
				.replace(new RegExp(value, 'g'), 'value')
				.replace(new RegExp(label, 'g'), 'label')
				.replace(new RegExp(`children|${children}`, 'g'), 'children')
		);
	}
	console.error('参数错误');
	return [];
};

/**
 * 初始化数据
 * @param  {String} res 传入的数据
 * @param  {String} id  数组是已str区分 ，默认'id'
 * @param  {String} _count
 * @param  {Object} initObj 判断是否有init
 * @param  {Array} initArr 判断是否有init
 * @return {String}
 * 参考reducers中的使用
 */
export const initItem = (res, str, count, initObj, initArr) => {
	let itemArr = [];
	let itemObj = {};
	let targetArr;
	const id = str || 'id';
	if (typeof res == "object" && res.data && res.data instanceof Array) { // 传入的不是数组。res.data是数组
		targetArr = res.data;
	} else if (res instanceof Array) { // 传入的是数组
		targetArr = res;
	} else {
		return console.error('初始化参数错误');
	}
	for (let i = 0; i < targetArr.length; i++) {
		itemArr = [...itemArr, targetArr[i][id]];
		itemObj = {
			...itemObj,
			[targetArr[i][id]]: initObj || targetArr[i]
		};
	}
	/* 判断是否有_count*/
	if (count) {
		const { _count } = res;
		return { itemArr, itemObj, _count };
	}
	return { itemArr, itemObj };
};
/**
 * 作为分页初始数据
 * for mobile
 */
export const initScroll = {
	// current: 0,
	total: 0,
	count: 0,
	data: []
};
/**
 * 作为分页初始数据
 * for pc
 */
export const initPage = {
	reset: false,
	current: 0,
	total: 0,
	count: 0,
	data: {}
};


const now = +(new Date());
let index = 0;

export const getUid = (comp) => {
	return `wya-${now}-${++index}`;
};

/**
 * 下一步，下一步设计
 */
export const createSession = (key, opts = {}) => {
	let session = key || getUid();

	if (session !== key) {
		let { path, query } = URL.parse();
		
		let config = URL.merge({
			path,
			query: {
				...query,
				session
			}
		});
		window.history.replaceState(null, null, config);
	}
	
	return session;
};
