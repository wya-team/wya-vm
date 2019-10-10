<template>
	<div class="vm-ruler">
		<div
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
				:style="{
					left: `${mouseX}px`
				}"
				class="vm-ruler__h-indicator"
				@click="handleAddxAxiasLine"
			>
				<div class="vm-ruler__hline-action">
					<span
						class="vm-ruler__hline-value"
					>
						{{ mouseX - guideWrapW }}
					</span>
				</div>
			</div>
		</div>
		<div
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
					:style="{
						top: `${mouseY}px`
					}"
					class="vm-ruler__v-indicator"
					@click="handleAddyAxiasLine"
				>
					<div class="vm-ruler__vline-action">
						<span class="vm-ruler__vline-value">
							{{ mouseY - guideWrapH }}
						</span>
					</div>
				</div>
			</div>
		</div>
		<div class="vm-guide-line" />
	</div>
</template>
<script>
import { hasClass } from '../../utils/helper';

export default {
	name: 'vm-ruler',
	data() {
		return {
			width: 2000,
			interval: 100,
			wrapX: 0, // 横轴起始x位置
			wrapW: 0, // 横轴宽度
			wrapY: 0, // 纵轴起始y位置
			wrapH: 0, // 纵轴高度
			guideWrapW: 20, // 辅助线开关区域宽度
			guideWrapH: 20, // 辅助线开关区域高度
			mouseX: 0,
			mouseY: 0,
			showHGuide: false, // 是否显示x轴辅助线
			showVGuide: false, // 是否显示y轴辅助线
			xLines: [], // x轴辅助线
			yLines: [], // y轴辅助线
		};
	},
	mounted() {
		let xAxias = document.querySelector('.vm-ruler__h-container').getBoundingClientRect();
		let yAxias = document.querySelector('.vm-ruler__v-container').getBoundingClientRect();
		this.wrapX = xAxias.x;
		this.wrapW = xAxias.width;
		this.wrapY = yAxias.y;
		this.wrapH = yAxias.height;
		Array.prototype.forEach.call(document.getElementsByClassName('vm-ruler__canvas'), (ctx => {
			this.repaint(ctx.getContext('2d'));
		}));
	},
	methods: {
		repaint(ctx) {
			ctx.beginPath();
			ctx.fillStyle = '#474747';
			ctx.fillRect(0, 0, this.width, 20);
			ctx.translate(20, 0); // (20, 0)坐标开始画10刻度线
			ctx.fillStyle = "#615E5B";
			ctx.save();
			for (let i = 0; i < this.width / this.interval; i++) {
				// 画刻度线
				ctx.fillStyle = "#615E5B";
				ctx.translate(i * this.interval, 0);
				ctx.fillRect(0, 0, 1, 20);
				ctx.restore();
				ctx.save();
				// 返回画刻度数字
				ctx.fillStyle = "#8C8D89";
				ctx.font = "12px";
				ctx.fillText(i * 100, i * this.interval + 4, 12);
			}
			// 还原到 (20, 0)坐标
			ctx.restore();
			// 移到 (20, 17)坐标
			ctx.translate(0, 17);
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
				this.mouseX = e.clientX - this.wrapX;
			} else {
				this.showHGuide = false;
			}
		},
		handleShowVGuide(e) {
			if (this.isCanvasArea(e, 'y')) {
				this.showVGuide = true;
				this.mouseY = e.clientY - this.wrapY;
			} else {
				this.showVGuide = false;
			}
		},
		/**
		 * 判断是否在canvas区域
		 */
		isCanvasArea(e, direction) {
			if (direction === 'x') {
				return e.x > this.wrapX
					&& e.x < this.wrapX + this.wrapW
					&& e.y > this.wrapY - this.guideWrapH
					&& e.y < this.wrapY;
			} else if (direction === 'y') {
				return e.x > this.wrapX - this.guideWrapW
					&& e.x < this.wrapX
					&& e.y > this.wrapY
					&& e.y < this.wrapY + this.wrapH;
			}
		},
		handleAddxAxiasLine() {
			this.xLines.push(this.mouseX);
		},
		handleAddyAxiasLine() {
			this.yLines.push(this.mouseY);
		}
	}
};
</script>
