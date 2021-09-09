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
	mounted() {
		this.keyboard.init();
	},
	destroyed() {
		this.keyboard.destroy();
	}
};
