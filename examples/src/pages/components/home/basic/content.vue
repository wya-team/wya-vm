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
		<vm-draggable 
			:parent="false"
			:x.sync="x"
			:y.sync="y"
			:z.sync="z"
			:w.sync="w"
			:h.sync="h"
			:r.sync="r"
			:handles="handles"
			:border="false"
		>
			<div>
				<div @click="handleClick">test</div>
				<input type="text" >
			</div>
		</vm-draggable>
	</div>
</template>

<script>
import { vmRegister, Draggable } from 'wya-vm';
import { Message } from 'iview';

let { Combo } = vmRegister();
export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo,
		'vm-draggable': Draggable
	},
	data() {
		return {
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
		},
		handleClick() {
			console.log('test');
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
