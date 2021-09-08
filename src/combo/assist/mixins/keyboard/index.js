import Keyboard from './manager';

export default {
	props: {
		keyboardEnabled: {
			type: Boolean,
			default: false
		}
	},
	data() {
		this.keyboard = new Keyboard(this);
		return {};
	},
	watch: {
		keyboardEnabled(v) {
			this.keyboard.enable(v);
		}
	},
	destroyed() {
		this.keyboard.destroy();
	}
};
