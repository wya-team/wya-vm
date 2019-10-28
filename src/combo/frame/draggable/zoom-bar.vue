<template>
	<div class="vm-zoom-bar vm-hack-editor">
		<div class="vm-zoom-bar__wrapper">
			<vc-select
				v-model="currentScale"
				:placeholder="currentPlaceholder"
				style="width: 75px"
				@change="handleChangeSelect"
			>
				<vc-option
					v-for="(item, index) in options"
					:value="item.value"
					:key="index"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
			<vc-slider
				v-model="currentScale"
				:step="0.01"
				:min="0.5"
				:max="2"
				:formatter="v => v * 100 + '%'"
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
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			currentScale: 1,
			currentSelect: 1,
		};
	},
	computed: {
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
				(clientW - borderSize * 2) / frameW, 
				(clientH - borderSize * 2) / frameH, 
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
				this.currentPlaceholder = v * 100 + '%';
			}
		}
	},
	created() {
		
	},
	methods: {
		handleChangeSlider(v) {
			this.$emit('update:scale', this.currentScale);
		},
		handleChangeSelect(v) {
			this.$emit('update:scale', this.currentScale);
		},
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-zoom-bar;

$theme-light-zoom-bg: #efefef;
$theme-dark-zoom-bg: #343434;

@include block($block) { 
	height: 40px; 
	z-index: 2;
	background: $theme-light-zoom-bg;
	box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.08);
	@include element(wrapper) {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
	@include when(dark) {
		background: $theme-dark-zoom-bg;
		box-shadow: none;
	}
}
</style>
