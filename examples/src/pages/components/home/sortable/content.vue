<template>
	<div>
		<!-- <vm-preview :data-source="list"/> -->
		<vm-combo 
			v-model="list"
			:frame-w="375"
			:frame-h="606"
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
		'vm-combo': Combo,
		'vm-preview': Preview,
	},
	data() {
		return {
			list: []
		};
	},
	computed: {
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
