<template>
	<div :style="{ width: w + 'px', height: h + 'px', background: bg, zIndex: z }">
		<vc-echarts 
			:options="options"
			:auto-resize="true"
		/>
	</div>
</template>
<script>
import { Echarts } from '@wya/vc';

export default {
	name: "vc-echarts-basic",
	components: {
		'vc-echarts': Echarts
	},
	props: {
		id: String,
		w: Number,
		h: Number,
		x: Number,
		y: Number,
		z: Number,
		r: Number,
		name: String,
		bg: String
	},
	data() {
		let fakeData = [];

		for (let i = 0; i <= 360; i++) {
			let t = (i / 180) * Math.PI;
			let r = Math.sin(2 * t) * Math.cos(2 * t);
			fakeData.push([r, i]);
		}

		return {
			fakeData
		};
	},
	computed: {
		options() {
			return {
				title: {
					text: this.name
				},
				legend: {
					data: ['line']
				},
				polar: {
					center: ['50%', '54%']
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross'
					}
				},
				angleAxis: {
					type: 'value',
					startAngle: 0
				},
				radiusAxis: {
					min: 0
				},
				series: [
					{
						coordinateSystem: 'polar',
						name: 'line',
						type: 'line',
						showSymbol: false,
						data: this.fakeData
					}
				],
				animationDuration: 2000
			};
		}
	}
};
</script>