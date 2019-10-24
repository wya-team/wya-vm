<template>
	<div>
		<vm-combo 
			v-model="list"
			:frame-style="{ border: '1px solid red', margin: 100 }"
			:frame-w="2000"
			:frame-h="2000"
			:style="style"
			@save="handleSave"
			@error="handleError"
		/>
	</div>
</template>

<script>
import { createVMDrags } from '@wya/vm';
import { Message } from '@wya/vc';
import { defaultModules } from './modules/root';

let { Combo, Preview } = createVMDrags(defaultModules);

export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo,
	},
	data() {
		return {
			list: [
				{
					id: Math.random(),
					module: 'page',
					w: 2000,
					h: 2000,
				}
			],
			style: {}
		};
	},
	computed: {

	},
	mounted() {
		// 需要减去padding值
		this.style = {
			width: window.innerWidth - 40 + 'px',
			height: window.innerHeight - 40 + 'px',
		};
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
