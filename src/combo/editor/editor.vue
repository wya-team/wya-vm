<template>
	<div 
		:style="{flex: `0 0 ${width}px` }" 
		class="vm-editor vm-hack-editor"
	>
		<div class="vm-editor__wrapper">
			<!-- <div class="vm-editor__arrow" /> -->
			<component
				ref="target"
				:is="`vm-${value.module}-editor`"
				v-bind.sync="value"
				@change="handleChange"
			/>
		</div>
	</div>
</template>

<script>
import { valueIsNaN, hasOwn, getUid, debounce } from "../../utils/helper";

export default {
	name: 'vm-editor',
	components: {
	},
	props: {
		dataSource: Array,
		value: Object,
		width: {
			type: Number,
			default: 327
		}
	},
	data() {
		return {
			currentId: this.value.id
		};
	},
	computed: {
	},
	watch: {
		"value.module": {
			handler(v) {
				this.resetCurEditor(this.value.id);
			}
		}
	},
	methods: {

		/**
		 * 延迟触发
		 * 用户端在激活时不要立马做操作，否者会存在问题
		 * TODO: 失焦时为异步情况，editor会被销毁，可以设计一个专门为API(传id)
		 */
		resetCurEditor: debounce(function (id) {
			this.currentId = id;
		}, 50),

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
						id: this.currentId,
						old: {
							[key]: val
						}
					});

					// TODO: remove(引用修改)
					let data = this.dataSource.find(i => i.id === this.currentId);
					data[key] = val;
				}
			}
		}
	},
};
</script>
<style lang="scss">
@import "../../style/index.scss";

$block: vm-editor;

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
}
</style>
