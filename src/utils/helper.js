/**
 * 判断浏览器是否支持passive, 默认preventDefault无效
 */
export const isPassiveSupported = (() => {
	let status = false;
	try {
		let opts = Object.defineProperty({}, "passive", {
			get() {
				status = true;
				return;
			}
		});
		window.addEventListener('test', null, opts);
	} catch (err) {
		console.log(err);
	}
	return status;
})();

/**
 * 判断是否存在
 */
export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

/**
 * 深拷贝
 */
let baseClone = (target, source) => {
	for (let k in source) {
		// 只拷贝实例属性，不进行原型的拷贝
		if (hasOwn(source, k)) {
			// 引用类型的数据单独处理
			if (typeof source[k] == 'object') {
				target[k] = Array.isArray(source[k]) ? [] : {};
				// 递归处理引用类型数据(利用引用处理)
				baseClone(target[k], source[k]);
			} else {
				// 值类型的数据直接进行拷贝
				target[k] = source[k];
			}
		}
	}
	return target;
};
export const cloneDeep = (source) => baseClone(Array.isArray(source) ? [] : {}, source);


/**
 * getUid
 */
const now = +(new Date());
let index = 0;
export const getUid = () => `vm-${now}-${++index}`;

/**
 * 判断是否是NaN
 */
/* eslint-disable no-self-compare */
export const valueIsNaN = v => v !== v; 

/**
 * 清楚vue对组件的缓存
 */
export const clearCtor = (obj) => {
	let target = cloneDeep(obj);
	for (let key in target) {
		if (target[key]._Ctor) {
			target[key]._Ctor = null;
		}
	}
	return target;
};

/**
 * 是否符合条件
 * @exceptions {
 *    tagName,
 *    ...HTMLElement
 * }
 */
export const eleInRegExp = (el, exceptions) => {
	for (let i in exceptions) {
		if (exceptions[i].test(el[i])) {
			return true;
		}
	}
	return false;
};