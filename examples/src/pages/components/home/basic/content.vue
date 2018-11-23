<template>
	<vm-frame :height="500" :width="500" style="border: 1px solid red; margin: 100px">
		<vm-draggable
			v-for="(it) in list"
			:key="it.id"
			:x.sync="it.x"
			:y.sync="it.y"
			:w.sync="it.w"
			:h.sync="it.h"
			:r.sync="it.r"
			:parent="true"
			@dragging="handleDrag"
			@resizing="handleResize"
		>
			<div :style="[it.style, { height: `${it.h}px`, width: `${it.w}px` }]">
				X: {{ it.x }} <br>
				Y: {{ it.y }} <br>
				Width: {{ it.w }} <br>
				Height: {{ it.h }} <br>
				Rotate: {{ it.r }} <br>
			</div>
		</vm-draggable>
	</vm-frame>
</template>

<script>
import { Draggable, Frame } from 'wya-vm';

let count = 0;
const getId = () => count++;
export default {
	name: 'tpl-links',
	components: {
		'vm-draggable': Draggable,
		'vm-frame': Frame,
	},
	data() {
		return {
			list: [
				{
					id: getId(),
					style: {
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
					style: {
						backgroundColor: 'blue',
						color: 'white'
					},
					// for vm-draggable
					w: 100,
					h: 100,
					r: 0,
					x: 100,
					y: 100,
					z: getId()
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
