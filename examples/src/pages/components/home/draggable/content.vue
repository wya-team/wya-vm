<template>
	<div>
		<vm-draggable
			:parent="false"
			:x.sync="x"
			:y.sync="y"
			:handles="handles"
		>
			<div>
				<div @click="handleClick">随意拖拽且可点击</div>
				<input v-model="value" type="text" >
			</div>
		</vm-draggable>
	</div>
</template>

<script>
import { Draggable } from '@wya/vm';
import { Message } from '@wya/vc';

export default {
	name: 'tpl-links',
	components: {
		'vm-draggable': Draggable
	},
	data() {
		return {
			value: '我可以输入',
			x: 0,
			y: 0,
			z: 0,
			w: 0, // auto
			h: 0, // auto
			r: 0,
			handles: []
		};
	},
	computed: {
		
	},
	created() {
	},
	methods: {
		handleClick() {
			Message.success('你点击了我');
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
