export { kebabCase, isEqualWith, cloneDeep, throttle, debounce } from 'lodash';
export { $ } from '@wya/utils';
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
 * 时间戳是有必要的
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

/**
 * 判断是否有指定类名
 * @param {*} el
 * @param {*} cls
 */
export const hasClass = (el, cls) => {
	if (!el || !cls) return false;
	if (cls.includes(' ')) {
		throw new Error('@wya/utils: 类名不应该包含空格');
	}
	if (el.classList) {
		return el.classList.contains(cls);
	} else {
		return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}
};
