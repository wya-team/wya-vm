export { kebabCase, isEqualWith, cloneDeep, throttle, debounce } from 'lodash';
export { $ } from '@wya/utils';
import { DEBUG } from './constants';
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
export const getUid = (name) => `vm${name ? `-${name}` : ''}-${now}${++index}`;

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


const rect2position = (rect) => ({
	left: rect.x,
	right: rect.x + rect.w,
	top: rect.y,
	bottom: rect.y + rect.h
});

export const allowSelection = (a, b) => {
	const R1 = rect2position(a);
	const R2 = rect2position(b);

	return !(
		(R1.right < R2.left)
		|| (R1.bottom < R2.top)
		|| (R2.right < R1.left)
		|| (R2.bottom < R1.top)
	);
};

export const Logger = {
	...console,
	debug: (...rest) => {
		DEBUG && console.log(`%c [@wya/vm]`, 'color: red; font-weight: bold', ...rest);
	}
};