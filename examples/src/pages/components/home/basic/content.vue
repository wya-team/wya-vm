<template>
	<div>
		<vm-combo 
			:data-source="list"
			:frame-style="{ border: '1px solid red', margin: 100 }"
			:frame-w="500"
			:frame-h="500"
			style="height: 1000px; width: 1000px;"
			@save="handleSave"
			@error="handleError"
		/>
	</div>
</template>

<script>
import { createVMDrags, Draggable } from '@wya/vm';
import { Message } from 'iview';

let { Combo } = createVMDrags();
export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo,
		'vm-draggable': Draggable
	},
	data() {
		return {
			value: '我可以输入',
			x: 0,
			y: 0,
			z: 0,
			w: 50,
			h: 50,
			r: 0,
			handles: []
		};
	},
	computed: {
		list() {
			return this.$store.state.homeBasic.list;
		}
	},
	created() {
	},
	methods: {
		handleSave(response) {
			console.log(response, this.list);
		},
		handleError({ type, msg }) {
			Message.error(msg);
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
