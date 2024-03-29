<template>
	<div class="vm-zoom-bar vm-hack-editor" :style="{ height: `${h}px` }">
		<div class="vm-zoom-bar__wrapper">
			<vc-select
				v-model="currentScale"
				:placeholder="currentPlaceholder"
				:portal-class-name="['vm-zoom-bar__select', { 'is-dark': theme === 'dark' }]"
				style="width: 75px"
				@change="handleChangeSelect"
			>
				<vc-option
					v-for="(item, index) in options"
					:key="index"
					:value="item.value"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
			<vc-slider
				v-model="currentScale"
				:step="0.01"
				:min="0.5"
				:max="2"
				:formatter="v => (v * 100).toFixed(0) + '%'"
				style="width: 160px; margin-left: 16px; margin-right: 15px;"
				@change="handleChangeSlider"
			/>
		</div>
	</div>
</template>

<script>
import { Slider, Select, Option } from '../../../vc';

const OPTIONS = [
	{
		label: '10%',
		value: 0.1
	},
	{
		label: '50%',
		value: 0.5
	},
	{
		label: '100%',
		value: 1
	},
	{
		label: '150%',
		value: 1.5
	},
	{
		label: '200%',
		value: 2
	}
];

export default {
	name: 'vm-zoom-bar',
	components: {
		'vc-slider': Slider,
		'vc-select': Select,
		'vc-option': Option
	},
	props: {
		scale: {
			type: Number,
			default: 1
		},
		theme: String,

		h: {
			type: Number,
			default: 0
		},

		frameW: {
			type: Number,
			default: 0
		},

		frameH: {
			type: Number,
			default: 0
		},

		clientW: {
			type: Number,
			default: 0
		},

		clientH: {
			type: Number,
			default: 0
		},

		borderSize: {
			type: Object,
			default() {
				return {
					top: 0,
					left: 0,
					bottom: 0,
					right: 0
				};
			}
		}
	},
	data() {
		return {
			zoomBarH: 40,
			currentScale: 1,
			currentSelect: 1,
		};
	},
	computed: {
		combo() {
			let parent = this.$parent;
			while (parent && !parent.VMComboId) {
				parent = parent.$parent;
			}
			return parent;
		},

		autoScale() {
			let { frameW, frameH, clientW, clientH, borderSize } = this;
			
			if (!frameW 
				|| !frameH 
				|| !clientW 
				|| !clientH
			) {
				return 1;
			}

			return Math.min(
				(clientW - borderSize.left - borderSize.right) / frameW, 
				(clientH - borderSize.top - borderSize.bottom) / frameH, 
				1
			);
		},

		options() {
			if (!this.autoScale 
				|| OPTIONS.some(i => i.value === this.autoScale)
			) {
				return OPTIONS;
			}

			return OPTIONS.concat([
				{
					label: '自适应',
					value: this.autoScale
				}
			]);
		}
	},
	watch: {
		scale: {
			immediate: true,
			handler(v) {
				this.currentScale = v;
				this.currentPlaceholder = (v * 100).toFixed(0) + '%';
			}
		},
		// 被吐槽， 变化太频繁（宽度变化会影响）
		// clientW() {
		// 	this.resetScale()
		// }
	},
	mounted() {
		this.resetScale(0);

		// 特殊API
		this.combo && (this.combo.resetScale = this.resetScale);
	},
	methods: {
		handleChangeSlider(v) {
			this.$emit('update:scale', this.currentScale);
		},
		handleChangeSelect(v) {
			this.$emit('update:scale', this.currentScale);
		},

		/**
		 * pageEditor变化在store中有被调用
		 * TODO: 去掉延迟
		 * TODO: showRuler为false时，无效
		 */
		resetScale(delay = 0) {
			setTimeout(() => {
				this.currentScale = this.autoScale;
				this.$emit('update:scale', this.currentScale);
			}, delay);
		}
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-zoom-bar;
@include block($block) { 
	z-index: 2;
	background: $theme-light-zoom-bg;
	box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.08);
	@include element(wrapper) {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
}
</style>
