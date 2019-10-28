<template>
	<div>
		<!-- <vm-preview :data-source="list"/> -->
		<vm-combo 
			v-model="list"
			:frame-w="375"
			:frame-h="606"
			:show-assist="false"
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

let { Combo, Preview } = createVMDrags(defaultModules, { mode: 'sortable' });

export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo
	},
	data() {
		return {
			list: [
				{
					id: Math.random(),
					module: 'page',
				}
			],
			style: {},
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

<style lang="scss">
</style>
