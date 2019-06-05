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
import { createVMDrags } from '@wya/vm';
import { Message } from '@wya/vc';
import { defaultModules } from './modules/root';

let { Combo } = createVMDrags(defaultModules, { mode: 'sortable' });

export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo
	},
	data() {
		return {
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
