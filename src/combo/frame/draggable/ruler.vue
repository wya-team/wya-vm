<template>
	<div :class="{ 'is-dark': isDark }" class="vm-ruler">
		<!-- 坐标原点，定位 -->
		<div
			:style="{
				width: `${guideSize}px`,
				height: `${guideSize}px`,
			}"
			:title="`单击${showGuide ? '隐藏' : '显示'}辅助线`"
			class="vm-ruler__guide"
			@click="showGuide = !showGuide"
		/>
		<!-- x轴 -->
		<div 
			ref="x"
			:style="{ transform: `translateX(${-scrollLeft}px)` }"
			class="vm-ruler__x"
			@mousemove="handleShowGuideX"
			@mouseleave="showGuideX = false"
		>
			<canvas
				ref="canvasX"
				:width="canvasW"
				:height="guideSize"
				class="vm-ruler__canvas"
			/>
			<!-- X虚线 -->
			<div
				v-show="showGuideX"
				ref="guideX"
				:style="{ left: `${mouseX * scale + placeholderW}px`}"
				class="vm-ruler__guide-x"
				@click.stop="handleAddLineX"
			>
				<span>
					{{ mouseX }}
				</span>
			</div>
			<!-- X实线 -->
			<template v-if="showGuide">
				<div
					v-for="(item, index) in linesX"
					:key="index"
					:style="{
						left: `${item * scale + placeholderW}px`,
					}"
					title="双击删除参考线"
					class="vm-ruler__guide-x is-solid"
					@mousedown.stop="handleMouseDown('x', index)"
					@dblclick="linesX.splice(index, 1)"
				>
					<span>
						{{ item }}
					</span>
				</div>
			</template>
		</div>
		<div class="vm-ruler__wrapper">
			<div class="vm-ruler__y">
				<div
					ref="y"
					:style="{
						transform: `rotate(90deg) translateX(${-scrollTop}px)`,
					}"
					class="vm-ruler__y-rotate"
					@mousemove="handleShowGuideY"
					@mouseleave="showGuideY = false"
				>
					<canvas
						ref="canvasY"
						:width="canvasW"
						:height="guideSize"
						class="vm-ruler__canvas"
					/>
					
					<!-- Y虚线 -->
					<div
						v-show="showGuideY"
						:style="{
							left: `${mouseY * scale + placeholderW}px`,
						}"
						class="vm-ruler__guide-y"
						@click.stop="handleAddLineY"
					>
						<span>
							{{ mouseY }}
						</span>
					</div>
					
					<!-- Y实线 -->
					<template v-if="showGuide">
						<div
							v-for="(item, index) in linesY"
							:key="index"
							:style="{
								left: `${item * scale + placeholderW}px`,
							}"
							class="vm-ruler__guide-y is-solid"
							title="双击删除参考线"
							@mousedown.stop="handleMouseDown('y', index)"
							@dblclick="linesY.splice(index, 1)"
						>
							<span>
								{{ item }}
							</span>
						</div>
					</template>
				</div>
			</div>
			<slot />
		</div>
	</div>
</template>

<script>
import { Clipboard } from '../../../vc';
import { $, debounce } from '../../../utils/helper';

const SCROLL_BAR_WIDTH = 30; // TODO: 计算滚动条宽度

export default {
	name: 'vm-ruler',
	components: {

	},
	props: {
		scrollTop: {
			type: Number,
			default: 0
		},
		scrollLeft: {
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
		scale: {
			type: Number,
			default: 1
		},
		guides: Array,
		borderSize: Number,
		theme: String,
	},
	data() {
		return {
			// 辅助线开关区域宽高
			guideSize: 20,

			// 是否显示鼠标移动的X/Y轴辅助线 (虚线)
			showGuide: true,
			showGuideX: false,
			showGuideY: false,
			// 鼠标在X/Y轴的坐标
			mouseX: 0,
			mouseY: 0,
			// 横轴起始X/Y位置
			offsetX: 0,
			offsetY: 0,

			// X/Y轴辅助线 (实线)
			linesX: [],
			linesY: [],

			movingAxias: '',
			movingIndex: -1,
		};
	},
	computed: {
		// 刻度的宽度, 5000用于滚动距离避免重绘
		canvasW() {
			const offset = this.borderSize * 2 + this.guideSize;
			const { frameW, frameH, scale, borderSize, guideSize, clientW, clientH } = this;

			let width = Math.max(
				frameW * scale + offset, 
				frameH * scale + offset, 
				clientW, 
				clientH
			);
			return SCROLL_BAR_WIDTH + width;
		},
		// 0刻度距离轴容器左边的距离
		placeholderW() {
			return this.borderSize + this.guideSize;
		},

		// 10刻度间隔(缩放后)
		interval() {
			return 100 * this.scale;
		},

		isDark() {
			return this.theme === 'dark';
		}
	},
	watch: {
		linesX: {
			deep: true,
			handler() {
				this.$emit('guides-change', [this.linesX, this.linesY]);
			}
		},
		linesY: {
			deep: true,
			handler() {
				this.$emit('guides-change', [this.linesX, this.linesY]);
			}
		}
	},

	created() {
		let watchArr = [
			'frameW', 
			'frameH', 
			'scale', 
			'clientW', 
			'clientH',
			'theme'
		];

		let hook = debounce(this.refreshCanvas, 50);

		watchArr.forEach(item => this.$watch(item, hook));
	},
	mounted() {
		this.$nextTick(() => {
			this.canvas = [this.$refs.canvasX, this.$refs.canvasY];
			this.offsetX = this.$refs.x.getBoundingClientRect().x;
			this.offsetY = this.$refs.y.getBoundingClientRect().y;
			this.refreshCanvas();
		});
	},

	destroyed() {
		this.operateDOMEvents('remove');
	},

	methods: {
		refreshCanvas() {
			this.canvas.forEach(canvas => this.repaint(canvas));
			window.canvas = this.canvas;
		},

		/**
		 * 轴距离容器左边有20px的间距和辅助线开关区域的宽度
		 */
		repaint(canvas) {
			if (!this._isMounted || !canvas) return;
			let { canvasW, guideSize, placeholderW, interval, isDark } = this;
			let ctx = canvas.getContext('2d');
			// 重置画布
			canvas.height = canvas.height;

			ctx.beginPath();
			ctx.fillStyle = isDark ? '#474747' : '#FAFAFA';
			ctx.fillRect(0, 0, canvasW, guideSize);
			ctx.translate(placeholderW, 0); // (20, 0)坐标开始画10刻度线
			ctx.fillStyle = isDark ? "#615E5B" : '#000';
			ctx.save();
			for (let i = 0; i < canvasW / interval; i++) {
				// 画刻度线
				ctx.fillStyle = isDark ? "#615E5B" : '#000';
				ctx.translate(i * interval, 0);
				ctx.fillRect(0, 0, 1, guideSize);
				ctx.restore();
				ctx.save();
				// 返回画刻度数字
				ctx.fillStyle = "#8C8D89";
				ctx.font = "12px";
				// 文字在轴内的 3/5 位置
				ctx.fillText(i * 100, i * interval + 4, guideSize / 5 * 3);
			}
			// 还原到 (20, 0)坐标
			ctx.restore();
			// 移到 (20, 17)坐标
			ctx.translate(0, guideSize - 3);
			ctx.save(); // (20, 17)坐标开始画1刻度线
			for (let i = 0; i < canvasW / interval * 10; i++) {
				if (i % 10 !== 0) {
					ctx.translate(i * interval / 10, 0);
					ctx.fillRect(0, 0, 1, 3);
					ctx.restore();
					ctx.save();
				}
			}
		},

		/**
		 * 参考X虚线显示
		 */
		handleShowGuideX(e) {
			const { offsetX, placeholderW, scrollLeft, scale } = this;
			if (
				this.$refs.x.contains(e.target)
				&& !$(e.target).hasClass('is-solid')
			) {
				this.showGuideX = true;
				this.mouseX = Math.floor((e.clientX - offsetX - placeholderW + scrollLeft) / scale);
			} else {
				this.showGuideX = false;
			}
		},

		/**
		 * 参考Y虚线显示
		 */
		handleShowGuideY(e) {
			const { offsetY, placeholderW, scrollTop, scale } = this;
			if (
				this.$refs.y.contains(e.target) 
				&& !$(e.target).hasClass('is-solid')
			) {
				this.showGuideY = true;
				this.mouseY = Math.floor((e.clientY - offsetY - placeholderW + scrollTop) / scale);
			} else {
				this.showGuideY = false;
			}
		},

		handleAddLineX() {
			!this.linesX.includes(this.mouseX) && this.linesX.push(this.mouseX);
		},

		handleAddLineY() {
			!this.linesY.includes(this.mouseY) && this.linesY.push(this.mouseY);
		},

		operateDOMEvents(type) {
			let fn = type === 'add' 
				? document.documentElement.addEventListener 
				: document.documentElement.removeEventListener;

			fn('mouseup', this.handleMouseUp);
			fn('mousemove', this.handleMouseMove);
		},

		// 鼠标按下事件
		handleMouseDown(axias, index) {
			Clipboard.clearSelection();

			this.movingIndex = index;
			this.movingAxias = axias;

			this.operateDOMEvents('add');
		},

		// 鼠标放手事件
		handleMouseUp() {
			Clipboard.clearSelection();
			this.operateDOMEvents('remove');
		},

		handleMouseMove(e) {
			const { offsetX, offsetY, placeholderW, scrollLeft, scrollTop, scale } = this;
			if (this.movingAxias === 'x') {
				this.$set(
					this.linesX, 
					this.movingIndex, 
					Math.floor((e.clientX - offsetX - placeholderW + scrollLeft) / scale),
				);
				return;
			}
			
			if (this.movingAxias === 'y') {
				this.$set(
					this.linesY, 
					this.movingIndex, 
					Math.floor((e.clientY - offsetY - placeholderW + scrollTop) / scale),
				);
				return;
			}
			
		},
	},
};
</script>

<style lang="scss">
@import "../../../style/index.scss";

$block: vm-ruler;
$blue-guide: rgba(0, 173, 255, .84);
$blue-label: rgba(64, 116, 180, .7);

$theme-light-ruler: #FAFAFA;
$theme-dark-ruler: #474747;

$theme-light-guide: #F0F0F0;
$theme-dark-guide: #535353;

@include block($block) {
	display: flex; 
	flex-direction: column;
	height: 100%;
	position: relative;
	@include element(x) {
		display: flex; 
		position: relative;
		z-index: 2;
	}
	@include element(wrapper) {
		display: flex; 
		height: 100%
	}
	@include element(y) {
		height: 100%; 
		width: 20px;
		z-index: 2;
	}
	@include element(y-rotate) {
		transform-origin: 0 100% 0;
		display: flex;
		position: relative;
		margin-top: -39px;
	}

	@include element(guide) {
		position: absolute;
		top: 0;
		left: 0;
		width: 20px;
		height: 20px;
		background: $theme-light-guide; 
		cursor: pointer;
		z-index: 3;
	}
	@include element(canvas) {
		background: $theme-light-ruler;
	}

	@include when(dark) {
		@include element(canvas) {
			background: $theme-dark-ruler;
		}
		@include element(guide) {
			background: $theme-dark-guide;
		}
		@include element(guide) {
			background: $theme-dark-guide; 
		}
	}
}

@include block(vm-ruler__guide-x) {
	position: absolute;
	height: 100vh;
	top: 0;
	border-left: 1px dashed $blue-guide;
	padding-left: 5px;
	cursor: ew-resize;
	> span {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		user-select: none;
		color: #fff;
		padding: 0 4px;
		line-height: 20px;
		border-radius: 1px;
		box-shadow: 0 0 5px -3px #000;
		background: $blue-label;
	}
	@include when(solid) {
		border-left: 1px solid $blue-guide;
	}
}


@include block(vm-ruler__guide-y) {
	transform: rotate(-90deg);
	transform-origin: 0 100% 0;
	position: absolute;
	width: 100vw;
	top: 20px;
	border-bottom: 1px dashed $blue-guide;
	padding-bottom: 5px;
	cursor: ns-resize;
	> span {
		transform: rotate(90deg);
		transform-origin: 0 0 0;
		position: absolute;
		left: 20px;
		top: 5px;
		user-select: none;
		color: #fff;
		padding: 0 4px;
		line-height: 20px;
		border-radius: 1px;
		box-shadow: 0 0 5px -3px #000;
		background: $blue-label;
	}
	@include when(solid) {
		border-bottom: 1px solid $blue-guide;
	}
}

</style>
