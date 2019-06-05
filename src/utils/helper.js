export cloneDeep from 'lodash/cloneDeep';
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
 *    id,
 *    tagName,
 *    className,
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