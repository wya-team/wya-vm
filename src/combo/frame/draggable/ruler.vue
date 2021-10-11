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
				:style="{ left: `${mouseX * scale + placeholderX}px`}"
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
						left: `${item * scale + placeholderY}px`,
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

		<div class="vm-ruler__wrapper" :style="{ height: `calc(100% - ${guideSize}px)` }">
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
							left: `${mouseY * scale + placeholderY}px`,
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
								left: `${item * scale + placeholderY}px`,
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
		theme: String,
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
		},
		scrollerSize: {
			type: Number,
			default: 0
		}
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
		/**
		 * 刻度的宽度
		 */
		canvasW() {
			const { frameW, frameH, scale, borderSize, guideSize, clientW, clientH } = this;
			const { scrollTop, scrollLeft, scrollerSize } = this;

			const offsetW = borderSize.left + borderSize.right + guideSize;
			const offsetH = borderSize.top + borderSize.bottom + guideSize;

			/**
			 * TODO: 动态计算
			 * 用于滚动距离避免重绘[动态计算canvasW时出现不绘制]，主要是元素拖动到画布以外，超过5000就不计算了
			 */
			let width = Math.max(
				5000,
				frameW * scale + offsetW,
				frameH * scale + offsetH,
				clientW,
				clientH
			);
			return scrollerSize + width;
		},
		// 0刻度距离轴容器左边的距离
		placeholderX() {
			return this.borderSize.left + this.guideSize;
		},

		placeholderY() {
			return this.borderSize.top + this.guideSize;
		},

		// 10刻度间隔(缩放后)
		interval() {
			const { scale } = this;
			// 10刻度所占像素初始值
			let width = 100;
			
			if (scale <= 0) return width;

			// 目标： 缩放后十刻度占屏幕实际尺寸 60 - 100 像素
			while (width * scale < 60) { // 缩小
				width += 50;
			}
			while (width * scale > 100) { // 放大
				width - 20 >= 0 ? width -= 20 : width -= 10;
			}
			return width * scale;
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
		// 兼容使用portal时，有300ms的动画延迟
		setTimeout(() => {
			this.canvas = [this.$refs.canvasX, this.$refs.canvasY];
			this.offsetX = this.$refs.x.getBoundingClientRect().x;
			this.offsetY = this.$refs.y.getBoundingClientRect().y;
			this.refreshCanvas();
		}, 300);
	},

	destroyed() {
		this.operateDOMEvents('remove');
	},

	methods: {
		refreshCanvas() {
			this.canvas && this.canvas.forEach((canvas, i) => this.repaint(canvas, i));
		},

		/**
		 * 轴距离容器左边有20px的间距和辅助线开关区域的宽度
		 */
		repaint(canvas, index) {
			if (!this._isMounted || !canvas) return;
			let { canvasW, guideSize, placeholderX, placeholderY, interval, isDark } = this;
			let ctx = canvas.getContext('2d');
			// 重置画布
			canvas.height = canvas.height; // eslint-disable-line

			ctx.beginPath();
			ctx.fillStyle = isDark ? '#474747' : '#FAFAFA';
			ctx.fillRect(0, 0, canvasW, guideSize);
			ctx.translate(index ? placeholderY : placeholderX, 0); // (20, 0)坐标开始画10刻度线
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
				ctx.fillText((i * interval / this.scale).toFixed(0), i * interval + 4, guideSize / 5 * 3);
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
			const { offsetX, placeholderX, scrollLeft, scale } = this;
			if (
				this.$refs.x.contains(e.target)
				&& !$(e.target).hasClass('is-solid')
			) {
				this.showGuideX = true;
				this.mouseX = Math.floor((e.clientX - offsetX - placeholderX + scrollLeft) / scale);
			} else {
				this.showGuideX = false;
			}
		},

		/**
		 * 参考Y虚线显示
		 */
		handleShowGuideY(e) {
			const { offsetY, placeholderY, scrollTop, scale } = this;
			if (
				this.$refs.y.contains(e.target)
				&& !$(e.target).hasClass('is-solid')
			) {
				this.showGuideY = true;
				this.mouseY = Math.floor((e.clientY - offsetY - placeholderY + scrollTop) / scale);
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
			const { offsetX, offsetY, placeholderX, placeholderY, scrollLeft, scrollTop, scale } = this;
			if (this.movingAxias === 'x') {
				this.$set(
					this.linesX,
					this.movingIndex,
					Math.floor((e.clientX - offsetX - placeholderX + scrollLeft) / scale),
				);
				return;
			}

			if (this.movingAxias === 'y') {
				this.$set(
					this.linesY,
					this.movingIndex,
					Math.floor((e.clientY - offsetY - placeholderY + scrollTop) / scale),
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

@include block($block) {
	display: flex;
	flex-direction: column;
	// height: 100%; // 动态计算
	position: relative;
	@include element(x) {
		display: flex;
		position: relative;
		z-index: 2;
	}
	@include element(wrapper) {
		display: flex;
		// height: 100% // 动态计算
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
		background: $theme-light-bg;
		cursor: pointer;
		z-index: 3;
	}
	@include element(canvas) {
		background: $theme-light-ruler-bg;
	}

	@include when(dark) {
		@include element(canvas) {
			background: $theme-dark-ruler-bg;
		}
		@include element(guide) {
			background: $theme-dark-guide-bg;
		}
		@include element(guide) {
			background: $theme-dark-guide-bg;
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
		left: 25px;
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
