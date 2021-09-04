<template>
	<div 
		v-if="currentValue"
		:style="styles" 
		class="vm-editor vm-hack-editor"
	>
		<div class="vm-editor__wrapper">
			<!-- <div class="vm-editor__arrow" /> -->
			<template v-if="currentValue.module !== SELECTION_MODULE">
				<!-- vm-type让组件内部处理如何渲染或其他操作 -->
				<component
					:is="`vm-${currentValue.module}-editor`"
					ref="target"
					:key="currentValue.id"
					v-bind.sync="currentValue"
					@change="handleChange"
				/>
			</template>
			<template v-else>
				<!-- 组合拖拽 -->
				<div />
			</template>
		</div>
	</div>
</template>

<script>
import { valueIsNaN, hasOwn, getUid, debounce } from "../../utils/helper";
import { SELECTION_MODULE } from "../../utils/constants";

export default {
	name: 'vm-editor',
	components: {
	},
	props: {
		value: Object,
		width: {
			type: Number,
			default: 328
		},
		height: Number
	},
	data() {
		return {
			SELECTION_MODULE,
			currentValue: this.value,
		};
	},
	computed: {
		styles() {
			const { width } = this;
			return { 
				flex: `0 0 ${width}px`, 
				width: `${width}px`, 
			};
		}
	},
	watch: {
		value: {
			deep: true,
			handler(v) {
				// 相关触发失焦，frame 中子元素需要设置prevent，默认不阻止
				this.resetCurEditor(this.value);
			}
		}
	},
	methods: {
		/**
		 * 延迟触发
		 * 用户端在激活时不要立马做操作, 失焦事件需要触发对应的change事件
		 */
		resetCurEditor: debounce(function () {
			this.currentValue = this.value;
		}, 10),

		/**
		 * hack操作
		 * 业务上避免使用该操作
		 *
		 * 从Viewer传递出来
		 * id 和 history 这是内部字段
		 */
		handleChange(opts = {}) {
			if (typeof opts !== 'object') return;
			const { id, history, ...rest } = opts;

			const changed = {};
			for (let key in rest) {
				let val = rest[key];

				['x', 'y', 'z', 'r', 'w', 'h'].includes(key) && (val = Number(val));

				if (hasOwn(rest, key) && !valueIsNaN(val)) {
					changed[key] = val;
				}
			}

			this.$emit('change', {
				type: 'UPDATE',
				id: id || this.currentValue.id,
				changed,
				// 是否记录历史
				history
			});
		},

		// 仅用于映射
		emitChange(id, opts = {}) {
			this.handleChange({
				...opts,
				id
			});
		}
	},
};
</script>
<style lang="scss">
@import "../../style/index.scss";

$block: vm-editor;

@include block($block) {
	flex-shrink: 0;
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
