<template>
	<set-title title="home-sortable" style="padding: 20px">
		<vm-content />
	</set-title>
</template>

<script>
import Content from '@components/home/sortable/content';

export default {
	name: 'vm-home-sortable',
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
