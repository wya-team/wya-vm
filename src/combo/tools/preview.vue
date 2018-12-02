<template>
	<div class="vm-tools-preview">
		<div class="__mask" @click="handleClose"/>
		<div class="__content">
			<div style="position: relative;" :style="css.style" :class="css.className">
				<div 
					v-for="(it) in dataSource" 
					:key="it.id" 
					:style="{ position: 'absolute', width: `${it.w}px`, height: `${it.h}px`, left: `${it.x}px`, top: `${it.y}px`, transform: `rotate(${it.r}deg)`}"
				>
					<component
						:is="`vm-${it.module}-viewer`" 
						v-bind="it" 
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';

const wrapper = {
	name: 'vm-preview',
	components: {

	},
	props: {
		dataSource: Array,
		css: {
			type: Object,
			default: () => ({ style: {}, className: "" })
		}
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
		handleClose() {
			this.$emit('close');
		}
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
			document.body.removeChild(this.vm.$el);
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
.vm-tools-preview {
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
	.__mask {
		position: absolute;
		z-index: 997;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(#000, 0.5);
		// opacity: 0;
		transition: opacity 0.2s;
	}
	.__content {
		z-index: 1000;
		overflow: auto;
		max-height: 100vh; 
		max-width: 100vw; 
	}
}

</style>
