<template>
	<div>
		<vm-combo 
			:data-source.sync="list"
			:frame-style="{ border: '1px solid red', margin: 100 }"
			:frame-w="500"
			:frame-h="500"
			style="height: 1000px; width: 1000px;"
		/>
	</div>
</template>

<script>
import { vmRegister } from 'wya-vm';

let { Combo } = vmRegister();
export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo
	},
	data() {
		return {
			list: []
		};
	},
	created() {
	},
	methods: {
	},
};
</script>

<style lang="scss" scoped>
</style>
