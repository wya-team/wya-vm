export const isPassiveSupported = (() => {
	let status = false;
	// 判断浏览器是否支持passive, 默认preventDefault无效
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