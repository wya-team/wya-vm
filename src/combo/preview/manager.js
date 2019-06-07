import Vue from 'vue';
import Wrapper from './popup.vue';
import { cloneDeep } from '../../utils/helper';

let Dom = document.body;

export default class PreviewManageer {
	constructor(ToolsPreview, mode) {
		this.ToolsPreview = ToolsPreview;
		this.mode = mode;
		this.vm = null;

		this.show = ::this.show;
		this.hide = ::this.hide;
	}

	show(opts = {}) {
		const div = document.createElement('div');
		const VueComponent = Vue.extend(cloneDeep({ 
			...Wrapper, 
			components: { 
				'vm-tools-preview': this.ToolsPreview
			}
		}));
		// 先销毁
		this.vm && this.vm.$emit('close');
		this.vm = new VueComponent({
			el: div,
			propsData: {
				...opts,
				mode: this.mode
			}
		});
		this.vm.$on('close', () => {
			this.vm.$destroy();
			// 主动卸载节点
			Dom.removeChild(this.vm.$el);
		});
		Dom.appendChild(this.vm.$el);
		return this.vm;
	}

	hide() {
		this.vm && this.vm.$emit('close');
	}
}

export const PreviewManager = Manager;