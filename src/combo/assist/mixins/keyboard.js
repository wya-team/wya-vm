/**
 * 键位查阅
 * https://github.com/wesbos/keycodes
 *
 * 后期集成: https://github.com/wya-team/wya-keyboard
 */
const doc = document.documentElement;
export default {
	data() {
		return {
			keyboardEnable: true
		};
	},
	mounted() {
		this._kOperateDOMEvents('add');
	},
	destroyed() {
		this._kOperateDOMEvents('remove');
	},
	methods: {
		_kOperateDOMEvents(type) {
			let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

			fn('keydown', this._kHandleKeydown);
		},

		_kHandleKeydown(e) {
			if (!this.keyboardEnable) return;
			if ((e.metaKey || e.ctrlKey)) {
				// z
				if ((e.keyCode === 90 || e.key === 'z')) {
					if (e.shiftKey) {
						this.redo();
					} else {
						this.undo();
					}
				}

				// 保存
				if (e.keyCode === 83 || e.key === 's') {
					e.preventDefault();
				}
			}
		},

		/**
		 * 设置键盘状态
		 */
		setKeyboardStatus(force) {
			this.keyboardEnable = typeof force !== 'undefined' 
				? !!forEach
				: !this.keyboardEnable;
		}
	}
};
