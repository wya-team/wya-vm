<template>
	<div class="vm-grid-lines">
		<div 
			v-for="item in yArr" 
			:key="`y_${item}`" 
			:style="{top: `${item}px`}"  
			class="vm-grid-lines__y"
		/>
		<div 
			v-for="item in xArr" 
			:key="`x_${item}`" 
			:style="{left: `${item}px`}"  
			class="vm-grid-lines__x"
		/>
	</div>
</template>

<script>
export default {
	name: 'vm-grid-lines',
	components: {

	},
	props: {
		width: Number,
		height: Number,
		grid: {
			type: Array,
			default: () => {
				return [10, 10];
			}
		},
	},
	data() {
		return {
		};
	},
	computed: {
		xArr() {
			let length = Math.floor(this.width / this.grid[0]);
			return Array.from({ length }, (v, i) => i * this.grid[0]);
		},
		yArr() {
			let length = Math.floor(this.height / this.grid[1]);
			return Array.from({ length }, (v, i) => i * this.grid[1]);
		}
	},
	watch: {
		
	},
	created() {
		
	},
	methods: {

	},
};
</script>

<style lang="scss">
.vm-grid-lines {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 0;
}
.vm-grid-lines__x {
	position: absolute;
	left: 0;
	width: 1px;
	height: 100%;
	border-left-width: 1px;
	border-left-style: dotted;
	border-left-color: rgb(214, 214, 214);
	box-sizing: border-box;
}
.vm-grid-lines__y {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1px;
	border-top-width: 1px;
	border-top-style: dotted;
	border-top-color: rgb(214, 214, 214); 
	box-sizing: border-box;
}
</style>
