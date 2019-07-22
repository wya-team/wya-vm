<template>
	<div
		:style="{
			padding: src ? '0px' : '20px 0'
		}"
		class="vm-basic-area-viewer"
	>
		<img
			:src="src"
			style="width: 100%;"
			class="vm-basic-area-viewer__bac"
		>
		<a
			v-for="(item, index) in formatterValue"
			:key="index"
			:style="[{
				height: `${item.h}px`,
				width: `${item.w}px`,
				left: `${item.x}px`,
				top: `${item.y}px`,
				'z-index': `${item.z}`,
				border: vm.type === 'frame' ? '1px dashed #5495F6' : 'none'
			}]"
			:to="item.path"
			class="vm-basic-area-viewer__item"
		>
			<div v-show="vm.type === 'frame'">
				<span style="padding: 1px 4px; background: #5495F6; color: #fff; white-space: nowrap;">
					热区{{ index + 1 }}
				</span>
			</div>
		</a>
	</div>
</template>

<script>
import { Utils } from '@utils/utils';

export default {
	name: 'vm-basic-area-viewer',
	components: {
	},
	props: {
		src: String,
		list: Array,
		vm: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
		};
	},
	computed: {
		formatterValue() {
			let arr = Utils.cloneDeep(this.list);
			let screenW = this.vm.type === 'frame' ? 375 : this.$global.width;
			return arr.map(item => {
				item.w = item.w / 375 * screenW;
				item.h = item.h / 375 * screenW;
				item.x = item.x / 375 * screenW;
				item.y = item.y / 375 * screenW;
				return item;
			});
		}
	},
	methods: {

	},
};
</script>

<style lang="scss">
@import "~@wya/sass/lib/mixins/bem.scss";
$block: vm-basic-area-viewer;

@include block($block) {
	position: relative;
	z-index: 0;
	background: #fff;
	@include element(item) {
		display: inline-block;
		position: absolute;
	}
}
</style>
