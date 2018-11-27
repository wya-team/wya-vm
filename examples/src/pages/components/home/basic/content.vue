<template>
	<div>
		<vm-frame 
			:height="500" 
			:width="500"
			:data-source="list"
			style="border: 1px solid red; margin: 100px"
		/>
		<vm-tools :height="200" :width="200" :data-source="tools"/>
	</div>
</template>

<script>
import { vmRegister } from 'wya-vm';

let { Draggable, Frame, Tools } = vmRegister();
let count = 0;
const getId = () => count++;
export default {
	name: 'tpl-links',
	components: {
		'vm-draggable': Draggable,
		'vm-frame': Frame,
		'vm-tools': Tools,
	},
	data() {
		return {
			tools: ['tpl'],
			list: [
				{
					id: getId(),
					// module
					module: "tpl",
					// 数据
					content: {
						backgroundColor: 'red',
						color: 'white'
					},
					// for vm-draggable
					w: 100,
					h: 100,
					r: 0,
					x: 0,
					y: 0,
					z: count
				},
				{
					id: getId(),
					// module
					module: "tpl",
					// 数据
					content: {
						backgroundColor: 'blue',
						color: 'white'
					},
					// for vm-draggable
					w: 100,
					h: 100,
					r: 0,
					x: 100,
					y: 100,
					z: count
				}
			]
		};
	},
	created() {
	},
	methods: {
		handleResize() {
		},
		handleDrag() {
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
