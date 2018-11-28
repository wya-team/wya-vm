<template>
	<div>
		<component 
			:is="`vm-${dataSource.module}-editor`" 
			v-bind.sync="dataSource" 
		/>
	</div>
</template>

<script>

export default {
	name: 'vm-editor',
	components: {
	},
	props: {
		dataSource: Object
	},
	data() {
		return {
		};
	},
	computed: {
	},
	created() {
	},
	methods: {
		
	},
};
</script>

<style lang="scss" scoped>
</style>
