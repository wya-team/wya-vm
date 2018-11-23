<template>
	<set-title title="home-basic" style="padding: 20px">
		<vm-content />
	</set-title>
</template>

<script>
import Content from '@components/home/basic/content';

export default {
	name: 'vm-home-basic',
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
