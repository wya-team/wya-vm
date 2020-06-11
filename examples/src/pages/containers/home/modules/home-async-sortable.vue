<template>
	<set-title title="home-async-sortable" style="padding: 20px">
		<vm-content />
	</set-title>
</template>

<script>
import Content from '@components/home/async-sortable/content';

export default {
	name: 'vm-home-async-sortable',
	components: {
		"vm-content": Content,
	},
	data() {
		return {
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
