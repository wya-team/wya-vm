<template>
	<div :style="style">
		<div 
			v-for="item in dataSource"
			:key="item"
			draggable
			@dragstart="handleStart($event, item)"
		>
			{{ item }}
		</div>
	</div>
</template>

<script>

export default {
	name: 'vm-tools',
	components: {
	},
	props: {
		width: Number,
		height: Number,
		type: {
			type: String,
			default: 'free' // sort-list
		},
		dataSource: Array
	},
	data() {
		return {
		};
	},
	computed: {
		style() {
			const w = this.width === 0 ? 'auto' : `${this.width}px`;
			const h = this.height === 0 ? 'auto' : `${this.height}px`;

			return {
				width: w,
				height: h
			};
		}
	},
	created() {
	},
	methods: {
		handleStart(e, item) {
			e.dataTransfer.setData('text', item);
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
