import { Logger } from '../../../../utils/helper';
/**
 * 键位查阅
 * https://github.com/wesbos/keycodes
 *
 * 后期集成: https://github.com/wya-team/wya-keyboard
 */
const IS_SERVER = typeof window === 'undefined';
const doc = !IS_SERVER && document.documentElement;
const getEventFn = (type, el) => ((type === 'add' ? el.addEventListener : el.removeEventListener)).bind(el);

class Keyboard {
	constructor(combo, opts = {}) {
		if (!combo) {
			throw new Error('combo必传');
		}
		this.combo = combo;
		this.frame = null;

		this.disabled = !this.combo.keyboardEnabled;
		// 辅助控制键盘事件是否启用
		this.isBlur = true;

		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleKeyup = this.handleKeyup.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	init() {
		this.frame = this.combo.$refs.frame;

		this.operateDOMEvents('add');
	}

	destroy() {
		this.operateDOMEvents('remove');
	}

	operateDOMEvents(type) {
		if (IS_SERVER) return;
		const globalDocument = getEventFn(type, doc);

		globalDocument('keydown', this.handleKeydown);
		globalDocument('keyup', this.handleKeyup);

		if (!this.frame) return;
		const frameElement = getEventFn(type, this.frame.$el);
		// 先frameElement再globalDocument
		frameElement('mousedown', this.handleFocus);
		globalDocument('mousedown', this.handleBlur);
	}

	handleKeydown(e) {
		if (this.disabled || this.isBlur) return;
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

	/**
	 * 聚焦frame区域，允许键盘事件
	 */
	handleFocus(e) {
		if (this.disabled || !this.isBlur || !this.frame.$el.contains(e.target)) return;

		this.isBlur = false;
		Logger.debug('keyboard focus');
	}

	/**
	 * 	离开frame区域，禁用键盘事件
	 * 	frame区域中有input时，可以触发禁用键盘事件
	 */
	handleBlur(e) {
		let el = e.target;
		let canEditor = Boolean(el.getAttribute('contenteditable')) || /^(INPUT|TEXTAREA)$/.test(el.nodeName);
		if (this.disabled || this.isBlur || (!canEditor && this.frame.$el.contains(e.target))) return;

		this.isBlur = true;
		Logger.debug('keyboard blur');
	}

	enable(force = true) {
		this.disabled = !force;
	}
}

export default Keyboard;