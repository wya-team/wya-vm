import Vue from 'vue';
import Wrapper from './menu.vue';
import { cloneDeep } from '../../utils/helper';

let Dom = document.body;
export default class MenuManager {
	constructor() {
		this.vm = null;
		this.show = ::this.show;
		this.hide = ::this.hide;
	}

	show(opts = {}) {
		const div = document.createElement('div');
		const VueComponent = Vue.extend(cloneDeep({
			...Wrapper,
		}));
		// 先销毁
		this.vm && this.vm.$emit('close');
		this.vm = new VueComponent({
			el: div,
			propsData: {
				...opts
			}
		});
		this.vm.$on('close', () => {
			this.vm.$destroy();
			// 主动卸载节点
			Dom.removeChild(this.vm.$el);
		});
		Dom.appendChild(this.vm.$el);
		return new Promise((resolve, reject) => {
			this.vm.$on('click', (...rest) => {
				resolve(...rest);
				this.vm.$emit('close');
			});
		});
	}

	hide() {
		this.vm && this.vm.$emit('close');
	}
}

export { MenuManager };
