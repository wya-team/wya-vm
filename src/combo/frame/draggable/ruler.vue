<template>
	<div class="vm-ruler">
		<div 
			:style="{ transform: `translateX(${-scrollLeft}px)` }"
			style="display: flex" 
		>
			<canvas
				:width="canvasW"
				:height="guideWrapH"
				class="vm-ruler__canvas"
			/>
		</div>
		<div style="display: flex; height: 100%">
			<div style="height: 100%; width: 20px">
				<div
					:style="{
						transform: `rotate(90deg) translateX(${-scrollTop}px)`,
						transformOrigin: '0 100% 0',
						display: 'flex',
						marginTop: '-40px'
					}"
				>
					<canvas
						:width="canvasW"
						:height="guideWrapH"
						class="vm-ruler__canvas"
					/>
				</div>
			</div>

			<slot />
		</div>
	</div>
</template>

<script>
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
		width: {
			type: Number,
			default: 0
		},
		height: {
			type: Number,
			default: 0
		},
	},
	data() {
		return {
			// 10刻度间隔(缩放后)
			interval: 100,
			// 辅助线开关区域宽高
			guideWrapH: 20,
			// 0刻度距离轴容器左边的距离
			placeholderW: 40,
		};
	},
	computed: {
		// 刻度的宽度, 5000用于滚动距离避免重绘
		canvasW() {
			return Math.max(this.width, this.height, 5000);
		}
	},
	watch: {
		width() {
			this.refreshCanvas();
		},
		height() {
			this.refreshCanvas();
		},
		scrollLeft() {
			
		},
		scrollTop() {
			
		}
	},
	mounted() {
		this.refreshCanvas();
	},
	methods: {
		refreshCanvas() {
			document.querySelectorAll('.vm-ruler__canvas').forEach((ctx) => {
				this.repaint(ctx.getContext('2d'));
			});
		},

		/**
		 * 轴距离容器左边有20px的间距和辅助线开关区域的宽度
		 */
		repaint(ctx) {
			let { canvasW, guideWrapH, placeholderW, interval } = this;
			
			ctx.clearRect(canvasW, guideWrapH, canvasW, guideWrapH);
			ctx.beginPath();
			ctx.fillStyle = '#474747';
			ctx.fillRect(0, 0, canvasW, guideWrapH);
			ctx.translate(placeholderW, 0); // (20, 0)坐标开始画10刻度线
			ctx.fillStyle = "#615E5B";
			ctx.save();
			for (let i = 0; i < canvasW / interval; i++) {
				// 画刻度线
				ctx.fillStyle = "#615E5B";
				ctx.translate(i * interval, 0);
				ctx.fillRect(0, 0, 1, guideWrapH);
				ctx.restore();
				ctx.save();
				// 返回画刻度数字
				ctx.fillStyle = "#8C8D89";
				ctx.font = "12px";
				// 文字在轴内的 3/5 位置
				ctx.fillText(i * 100, i * interval + 4, guideWrapH / 5 * 3);
			}
			// 还原到 (20, 0)坐标
			ctx.restore();
			// 移到 (20, 17)坐标
			ctx.translate(0, guideWrapH - 3);
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
	},
};
</script>

<style lang="scss">
.vm-ruler {
	display: flex; 
	flex-direction: column;
	height: 100%
}
</style>
