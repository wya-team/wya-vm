<template>
	<div>
		test
	</div>
</template>

<script>
import Vue from 'vue';

const wrapper = {
	name: 'vm-preview',
	components: {

	},
	props: {

	},
	data() {
		return {
		};
	},
	computed: {

	},
	watch: {
		
	},
	created() {
		
	},
	methods: {

	},
};
export default wrapper;

export const Preview = {
	vm: null,
	show(opts = {}) {
		const { components = {}, ...rest } = opts;
		const div = document.createElement('div');
		const VueComponent = Vue.extend({ 
			...wrapper, 
			components: { 
				...wrapper.components, 
				...components 
			} 
		});
		// 先销毁
		this.vm && this.vm.$emit('close');
		this.vm = new VueComponent({
			el: div,
			propsData: {
				...rest
			}
		});
		this.vm.$on('close', () => {
			this.vm.$destroy();
			// 主动卸载节点
			Dom.removeChild(this.vm.$el);
		});
		document.body.appendChild(this.vm.$el);

		return this.vm;
	},
	hide() {
		this.vm && this.vm.$emit('close');
	}
};
</script>

<style lang="scss" scoped>
</style>
