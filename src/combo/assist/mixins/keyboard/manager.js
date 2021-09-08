import { Logger } from '../../../../utils/helper';
/**
 * 键位查阅
 * https://github.com/wesbos/keycodes
 *
 * 后期集成: https://github.com/wya-team/wya-keyboard
 */
const IS_SERVER = typeof window === 'undefined';
const doc = !IS_SERVER && document.documentElement;

class Keyboard {
	constructor(combo, opts = {}) {
		if (!combo) {
			throw new Error('combo必传');
		}
		this.combo = combo;
		this.disabled = !this.combo.keyboardEnabled;

		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleKeyup = this.handleKeyup.bind(this);

		this.init();
	}

	init() {
		this.operateDOMEvents('add');
	}

	destroy() {
		this.operateDOMEvents('remove');
	}

	operateDOMEvents(type) {
		if (IS_SERVER) return;
		let fn = type === 'add' ? doc.addEventListener : doc.removeEventListener;

		fn('keydown', this.handleKeydown);
		fn('keyup', this.handleKeyup);
	}

	handleKeydown(e) {
		if (this.disabled) return;
		Logger.debug(`${e.ctrlKey ? 'ctrl' : ''}${e.metaKey ? 'command' : ''}${e.shiftKey ? ' + shift' : ''}${!e.ctrlKey && !e.metaKey && !e.shiftKey ? '' : ' + '}${e.key}`); // eslint-disable-line

		if ((e.metaKey || e.ctrlKey)) {
			// ctrl/command + z
			if ((e.keyCode === 90 || e.key === 'z')) {
				if (e.shiftKey) {
					this.combo.redo();
				} else {
					this.combo.undo();
				}
				return;
			}

			// ctrl/command + c
			if ((e.keyCode === 67 || e.key === 'c')) {
				this.combo.copy();
				return;
			}

			// ctrl/command + x
			if ((e.keyCode === 88 || e.key === 'x')) {
				this.combo.cut();
				return;
			}

			// ctrl/command + v
			if ((e.keyCode === 86 || e.key === 'v')) {
				this.combo.paste();
				return;
			}

			// ctrl/command + s
			if (
				(e.keyCode === 68 || e.key === 'd')
				|| (e.keyCode === 83 || e.key === 's')
			) {
				e.preventDefault();
				return;
			}
		}
	}

	handleKeyup(e) {
		if (this.disabled) return;
	}

	enable(force = true) {
		this.disabled = !force;
	}
}

export default Keyboard;