<template>
	<set-title title="home-main" style="padding: 20px">
		<vm-content />
	</set-title>
</template>

<script>
import Content from '@components/home/main/content';

export default {
	name: 'vm-home-main',
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
