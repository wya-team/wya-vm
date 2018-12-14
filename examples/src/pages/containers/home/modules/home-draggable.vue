<template>
	<set-title title="home-draggable" style="padding: 20px">
		<vm-content />
	</set-title>
</template>

<script>
import Content from '@components/home/draggable/content';

export default {
	name: 'vm-home-draggable',
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
