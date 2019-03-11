/**
 * 键位查阅
 * https://github.com/wesbos/keycodes
 */
const UNDO = /([(Meta|Control)]{1})(z)$/i;
const REDO = /([(Meta|Control)]{1})(Shift)(z)$/i;

export default (opts = {}) => {
	let keyArr = [];
	return {
		mounted() {
			this.operateDOMEvents('add');
		},
		destroyed() {
			this.operateDOMEvents('remove');
		},
		methods: {
			operateDOMEvents(type) {
				let fn = type === 'add' ? window.addEventListener : window.removeEventListener;

				fn('keydown', this.handleDown, false);
				fn('keypress', this.handlePress, false);
				fn('keyup', this.handleUp, false);
			},
			handleDown(e) {
				// 暂不处理大小写区分
				if (!keyArr.includes(e.key)) {
					keyArr.push(e.key);
				}
			},
			handlePress() {},
			handleUp(e) {
				keyArr = keyArr.filter((item) => item != e.key);
			}
		}
	};
};
  