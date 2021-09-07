/**
 * 键位查阅
 * https://github.com/wesbos/keycodes
 *
 * 后期集成: https://github.com/wya-team/wya-keyboard
 */
const doc = document.documentElement;
export default {
	mounted() {
		this.operateDOMKeyEvents('add');
	},
	destroyed() {
		this.operateDOMKeyEvents('remove');
	},
	methods: {
		operateDOMKeyEvents(type) {
			let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

			fn('keydown', this.handleKeydown);
			fn('keyup', this.handleKeyup);
		},

		handleKeydown(e) {
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

		handleKeyup(e) {
			
		}
	}
};
