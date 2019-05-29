<template>
	<div class="vm-align-lines">
		<div 
			v-for="item in alignData.yArr" 
			:key="`y_${item}`" 
			:style="{top: `${item}px`}"  
			class="__y"
		/>
		<div 
			v-for="item in alignData.xArr" 
			:key="`x_${item}`" 
			:style="{left: `${item}px`}"  
			class="__x"
		/>
	</div>
</template>

<script>
export default {
	name: 'vm-align-lines',
	components: {

	},
	props: {
		dataSource: {
			type: Array,
			default: () => ([])
		},
		editor: Object
	},
	data() {
		return {
		};
	},
	computed: {
		alignData() {
			if (this.dataSource.length <= 1 || !this.editor) {
				return {
					xArr: [],
					yArr: []
				};
			}
			const { x, y, w, h } = this.editor || {};
			let xArr = [x, x + w / 2, x + w];
			let yArr = [y, y + h / 2, y + h];

			let xyObj = this.dataSource.reduce((result, itemData = {}) => {

				const { x, y, w, h, id } = itemData;
				if (id !== this.editor.id) {
					let xArr = [x, x + w / 2, x + w];
					let yArr = [y, y + h / 2, y + h];
					result.xArr = [...result.xArr, ...xArr];
					result.yArr = [...result.yArr, ...yArr];
				}
				return result;
			}, {
				xArr: [],
				yArr: []
			});
			return {
				xArr: xArr.filter(item => xyObj.xArr.includes(item)),
				yArr: yArr.filter(item => xyObj.yArr.includes(item))
			};
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

<style lang="scss" scoped>
.vm-align-lines {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 0;
	.__x {
		position: absolute;
		left: 0;
		width: 1px;
		height: 100%;
		border-left-width: 1px;
		border-left-style: dotted;
		border-left-color: #1fb6ff;
		box-sizing: border-box;
	}
	.__y {
		position: absolute;
		top: 0;
		width: 100%;
		height: 1px;
		border-top-width: 1px;
		border-top-style: dotted;
		border-top-color: #1fb6ff; 
		box-sizing: border-box;
	}
}
</style>
