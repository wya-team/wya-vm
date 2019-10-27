<template>
	<div class="vm-zoom-bar">
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
@include block($block) {
	background: #4a4a4a; 
	height: 40px; 
	z-index: 2;
	@include element(wrapper) {
		display: flex;
		align-items: center;
		justify-content: flex-end;
	}
}
</style>
