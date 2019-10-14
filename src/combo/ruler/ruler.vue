<template>
	<div class="vm-ruler">
		<div
			:style="{
				left: `${guideWrapH}px`,
				transform: `translateX(${-scrollLeft}px)`
			}"
			class="vm-ruler__h-container"
			@mousemove="handleShowHGuide"
			@mouseleave="showHGuide = false"
		>
			<canvas
				:width="width"
				:height="guideWrapH"
				class="vm-ruler__canvas"
			/>
			<div
				v-show="showHGuide"
				class="vm-ruler__h-indicator"
				@click.stop="handleAddxAxiasLine"
			>
				<div
					:style="{
						left: `${hGuidePos}px`
					}"
					class="vm-ruler__hline-action"
				>
					<span class="vm-ruler__hline-value">
						{{ Math.round(mouseX) }}
					</span>
				</div>
			</div>
			<div v-show="showGuide" class="vm-ruler__lines-wrap">
				<div
					v-for="(item, index) in xLines"
					:key="index"
					:style="{
						left: `${placeholderW + item * zoom}px`,
						'z-index': moveLine.axias === 'x' && index === moveLine.index ? 1 : 0
					}"
					class="vm-ruler__hline-action"
					title="双击删除参考线"
					@mousedown.stop="handleMouseDown('x', index)"
					@dblclick="xLines.splice(index, 1)"
				>
					<span class="vm-ruler__hline-value">
						{{ Math.round(item) }}
					</span>
				</div>
			</div>
		</div>
		<div
			:style="{
				transform: `rotate(90deg) translateX(${-scrollTop}px)`
			}"
			class="vm-ruler__v-container"
			@mousemove="handleShowVGuide"
			@mouseleave="showVGuide = false"
		>
			<canvas
				:width="width"
				:height="guideWrapH"
				class="vm-ruler__canvas"
			/>
			<div class="vm-ruler__vline-wrap">
				<div
					v-show="showVGuide"
					class="vm-ruler__v-indicator"
					@click.stop="handleAddyAxiasLine"
				>
					<div
						:style="{
							top: `${vGuidePos}px`
						}"
						class="vm-ruler__vline-action"
					>
						<span class="vm-ruler__vline-value">
							{{ Math.round(mouseY) }}
						</span>
					</div>
				</div>
				<div v-show="showGuide" class="vm-ruler__lines-wrap">
					<div
						v-for="(item, index) in yLines"
						:key="index"
						:style="{
							top: `${placeholderW + item * zoom}px`,
							'z-index': moveLine.axias === 'y' && index === moveLine.index ? 1 : 0
						}"
						class="vm-ruler__vline-action"
						title="双击删除参考线"
						@mousedown.stop="handleMouseDown('y', index)"
						@dblclick="yLines.splice(index, 1)"
					>
						<span class="vm-ruler__vline-value">
							{{ Math.round(item) }}
						</span>
					</div>
				</div>
			</div>
		</div>
		<div
			:style="{
				width: `${guideWrapH}px`,
				height: `${guideWrapH}px`,
			}"
			:title="`单击${showGuide ? '隐藏' : '显示'}辅助线`"
			class="vm-guide-line"
			@click="showGuide = !showGuide"
		/>
	</div>
</template>
<script>
import { hasClass } from '../../utils/helper';

export default {
	name: 'vm-ruler',
	props: {
		zoom: {
			type: Number,
			default: 1
		},
		scrollLeft: {
			type: Number,
			default: 0
		},
		scrollTop: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			width: 2000, // 轴长
			initInterval: 100, // 10刻度间隔(缩放前)
			interval: 100, // 10刻度间隔(缩放后)
			wrapX: 0, // 横轴起始x位置
			wrapY: 0, // 纵轴起始y位置
			placeholderW: 20, // 0刻度距离轴容器左边的距离
			guideWrapH: 20, // 辅助线开关区域宽高
			mouseX: 0, // 鼠标在X轴的坐标
			mouseY: 0, // 鼠标在Y轴的坐标
			showGuide: true, // 显示固定的辅助线开关 (实线)
			showHGuide: false, // 是否显示鼠标移动的x轴辅助线 (虚线)
			showVGuide: false, // 是否显示鼠标移动的y轴辅助线 (虚线)
			xLines: [100], // x轴辅助线 (实线)
			yLines: [50], // y轴辅助线 (实线)
			isMousePress: false, // 鼠标是否按住
			moveLine: { // 被鼠标按住的辅助线 (实线)
				axias: 'x',
				index: 0
			}
		};
	},
	computed: {
		hGuidePos() { // 距离x轴左端的实际像素
			return this.mouseX * this.zoom + this.placeholderW;
		},
		vGuidePos() { // 距离y轴上端的实际像素
			return this.mouseY * this.zoom + this.placeholderW;
		}
	},
	watch: {
		zoom(v) {
			this.interval = this.initInterval;
			this.interval = this.interval * v;
			Array.prototype.forEach.call(document.getElementsByClassName('vm-ruler__canvas'), (ctx => {
				ctx.height = ctx.height;
				this.repaint(ctx.getContext('2d'));
			}));
			this.exportLines();
		},
		scrollLeft() {
			this.exportLines();
		},
		scrollTop() {
			this.exportLines();
		}
	},
	mounted() {
		this.$nextTick(() => {
			let xAxias = document.querySelector('.vm-ruler__h-container').getBoundingClientRect();
			let yAxias = document.querySelector('.vm-ruler__v-container').getBoundingClientRect();
			this.wrapX = xAxias.x;
			this.wrapY = yAxias.y;
			Array.prototype.forEach.call(document.getElementsByClassName('vm-ruler__canvas'), (ctx => {
				this.repaint(ctx.getContext('2d'));
			}));
			// 辅助线被鼠标按下事件
			window.addEventListener('mouseup', this.handleMouseUp);
			// 辅助线被移动事件
			window.addEventListener('mousemove', this.handleMouseMove);
			this.exportLines();
		});
	},
	destroyed() {
		window.removeEventListener('mouseup', this.handleMouseUp);
		window.removeEventListener('mousemove', this.handleMouseMove);
	},
	methods: {
		/**
		 * 轴距离容器左边有20px的间距和辅助线开关区域的宽度
		 */
		repaint(ctx) {
			ctx.beginPath();
			ctx.fillStyle = '#474747';
			ctx.fillRect(0, 0, this.width, this.guideWrapH);
			ctx.translate(this.placeholderW, 0); // (20, 0)坐标开始画10刻度线
			ctx.fillStyle = "#615E5B";
			ctx.save();
			for (let i = 0; i < this.width / this.interval; i++) {
				// 画刻度线
				ctx.fillStyle = "#615E5B";
				ctx.translate(i * this.interval, 0);
				ctx.fillRect(0, 0, 1, this.guideWrapH);
				ctx.restore();
				ctx.save();
				// 返回画刻度数字
				ctx.fillStyle = "#8C8D89";
				ctx.font = "12px";
				// 文字在轴内的 3/5 位置
				ctx.fillText(i * 100, i * this.interval + 4, this.guideWrapH / 5 * 3);
			}
			// 还原到 (20, 0)坐标
			ctx.restore();
			// 移到 (20, 17)坐标
			ctx.translate(0, this.guideWrapH - 3);
			ctx.save(); // (20, 17)坐标开始画1刻度线
			for (let i = 0; i < this.width / this.interval * 10; i++) {
				if (i % 10 !== 0) {
					ctx.translate(i * this.interval / 10, 0);
					ctx.fillRect(0, 0, 1, 3);
					ctx.restore();
					ctx.save();
				}
			}
		},
		handleShowHGuide(e) {
			if (this.isCanvasArea(e, 'x')) {
				this.showHGuide = true;
				this.mouseX = +((e.clientX - this.wrapX - this.placeholderW + this.scrollLeft) / this.zoom).toFixed(1);
			} else {
				this.showHGuide = false;
			}
		},
		handleShowVGuide(e) {
			if (this.isCanvasArea(e, 'y')) {
				this.showVGuide = true;
				this.mouseY = +((e.clientY - this.wrapY - this.placeholderW + this.scrollTop) / this.zoom).toFixed(1);
			} else {
				this.showVGuide = false;
			}
		},
		/**
		 * 判断是否在canvas区域
		 */
		isCanvasArea(e, direction) {
			let path = e.path || (e.composedPath && e.composedPath()) || [];
			// 排除固定辅助线区域
			if (path.some(v => hasClass(v, 'vm-ruler__lines-wrap'))) {
				return false;
			}
			if (direction === 'x') {
				return e.x + this.scrollLeft > this.wrapX
					&& e.x + this.scrollLeft < this.wrapX + this.width
					&& e.y > this.wrapY - this.placeholderW
					&& e.y < this.wrapY;
			} else if (direction === 'y') {
				return e.x > this.wrapX - this.placeholderW
					&& e.x < this.wrapX
					&& e.y + this.scrollTop > this.wrapY
					&& e.y + this.scrollTop < this.wrapY + this.width;
			}
		},
		handleAddxAxiasLine() {
			this.xLines.push(this.mouseX);
			this.exportLines();
		},
		handleAddyAxiasLine() {
			this.yLines.push(this.mouseY);
			this.exportLines();
		},
		handleMouseMove(e) {
			if (!this.isMousePress) return;
			if (this.moveLine.axias === 'x') {
				this.xLines.splice(this.moveLine.index, 1);
				let value = +((e.clientX - this.wrapX - this.placeholderW + this.scrollLeft) / this.zoom).toFixed(1);
				this.xLines.splice(this.moveLine.index, 0, value);
			} else if (this.moveLine.axias === 'y') {
				this.yLines.splice(this.moveLine.index, 1);
				let value = +((e.clientY - this.wrapY - this.placeholderW + this.scrollTop) / this.zoom).toFixed(1);
				this.yLines.splice(this.moveLine.index, 0, value);
			}
			this.exportLines();
		},
		handleMouseUp() {
			this.isMousePress = false;
		},
		handleMouseDown(axias, index) {
			this.isMousePress = true;
			this.moveLine = {
				axias,
				index
			};
		},
		exportLines() {
			this.$emit('change', {
				x: this.xLines,
				y: this.yLines
			});
		}
	}
};
</script>
