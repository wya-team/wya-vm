<template>
	<div class="vm-tools-preview">
		<transition name="fade">
			<div v-show="visible" class="__mask" @click="handleClose" />
		</transition>
		<transition name="fade">
			<div v-show="visible" class="__content">
				<div :style="css.style" :class="css.className" style="position: relative;">
					<div 
						v-for="(it) in dataSource" 
						:key="it.id" 
						:style="{ 
							position: 'absolute', 
							width: `${it.w}px`, 
							height: `${it.h}px`, 
							left: `${it.x}px`, 
							top: `${it.y}px`, 
							transform: `rotate(${it.r}deg)`
						}"
					>
						<component
							:is="`vm-${it.module}-viewer`" 
							v-bind="it" 
						/>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
import Vue from 'vue';
import { cloneDeep, clearCtor } from '../../utils/helper';

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
			visible: false,
			transform: `translate(-100px, -100px)`
		};
	},
	computed: {

	},
	watch: {
		
	},
	mounted() {
		this.visible = true;
	},
	updated() {
	},
	methods: {
		handleClose() {
			this.visible = false;
			this.transform = `translate(-100px, -100px)`;
			setTimeout(() => {
				this.$emit('close');
			}, 300); // 动画时间
		}
	},
};
export default wrapper;

let Dom = document.body;
export const Preview = {
	vm: null,
	show(opts = {}) {
		let { components = {}, ...rest } = opts;

		// 清理缓存
		components = clearCtor(components);

		const div = document.createElement('div');
		const VueComponent = Vue.extend(cloneDeep({ 
			...wrapper, 
			components: { 
				...wrapper.components, 
				...components 
			} 
		}));
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
		Dom.appendChild(this.vm.$el);
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
		background-color: rgba(#000, 0.2);
		// opacity: 0;
		transition: opacity 0.2s;
	}
	.__content {
		z-index: 1000;
		overflow: auto;
		max-height: 100vh; 
		max-width: 100vw; 
		transition: transform 0.2s, opacity 0.2s;
	}
}
.fade-enter, .fade-leave-active {
	opacity: 0;
}
</style>
