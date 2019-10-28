<template>
	<div 
		:style="{flex: `0 0 ${width}px` }" 
		:key="key"
		class="vm-editor vm-hack-editor"
	>
		<div class="vm-editor__wrapper">
			<!-- <div class="vm-editor__arrow" /> -->
			<component
				ref="target"
				:is="`vm-${dataSource.module}-editor`"
				v-bind.sync="dataSource"
				@change="handleChange"
			/>
		</div>
	</div>
</template>

<script>
import { valueIsNaN, hasOwn, getUid } from "../../utils/helper";

export default {
	name: 'vm-editor',
	components: {
	},
	props: {
		dataSource: Object,
		width: {
			type: Number,
			default: 355
		}
	},
	data() {
		return {
			key: getUid()
		};
	},
	computed: {
	},
	watch: {
		"dataSource.module": {
			handler() {
				this.key = getUid();
			}
		}
	},
	methods: {
		/**
		 * hack操作
		 * 业务上避免使用该操作
		 */
		handleChange(opts = {}) {
			if (typeof opts !== 'object') return;
			for (let key in opts) {
				let val = opts[key];

				['x', 'y', 'z', 'r', 'w', 'h'].includes(key) && (val = Number(val));

				if (hasOwn(opts, key) && !valueIsNaN(val)) {

					this.$emit('change', {
						type: 'update',
						id: this.dataSource.id,
						old: {
							[key]: val
						}
					});
					this.$refs.target.$emit(`update:${key}`, val);
				}
			}

		}
	},
};
</script>
<style lang="scss">
@import "../../style/index.scss";

$block: vm-editor;
$theme-dark-editor-bg: #535353;

@include block($block) {
	flex-shrink: 0;
	// margin-left: 20px;
	// min-width: 446px; // 暂时写死
	// max-width: 446px;
	// flex: 0 0 354px;
	@include element(wrapper) {
		position: relative;
		padding: 0;
		height: 100%;
		border: 1px solid #0000001a;
		border-radius: 0px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
		background: #fff;
		z-index: 2;
	}
	@include element(arrow) {
		left: -7px;
		top: 20px;
		width: 14px;
		height: 14px;
		transform: translateX(-50%) rotate(45deg);
		box-shadow: -3px 3px 7px rgba(0, 0, 0, 0.07);
		background: #fff;
		transform: rotate(45deg);
		position: absolute;
		border-color: #0000;
		border-style: solid;
		border-left: 1px solid #0000001a;
		border-bottom: 1px solid #0000001a;
	}

	@include when(dark) {
		@include element(wrapper) {
			background: $theme-dark-editor-bg;
			color: white;
		}
	}
}
</style>
