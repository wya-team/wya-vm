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
 * 深拷贝
 */
let baseClone = (target, source) => {
	for (let k in source) {
		// 只拷贝实例属性，不进行原型的拷贝
		if (Object.hasOwnProperty.call(source, k)) {
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
export const cloneDeep = (source) => baseClone({}, source);