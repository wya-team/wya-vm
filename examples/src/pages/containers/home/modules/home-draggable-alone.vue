<template>
	<set-title title="home-draggable-alone" style="padding: 20px">
		<vm-content />
	</set-title>
</template>

<script>
import Content from '@components/home/draggable-alone/content';

export default {
	name: 'vm-home-draggable-alone',
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
