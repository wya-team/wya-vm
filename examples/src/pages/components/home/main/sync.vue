<template>
	<div @click="handleClick">{{ dataSource }}</div>
</template>

<script>

export default {
	name: 'tpl-links',
	props: {
		dataSource: Array
	},
	data() {
		return {
		};
	},
	created() {
	},
	methods: {
		handleClick() {
			// 操作了源数组
			this.dataSource.push(2);
			// this.$emit('update:count', '');
			this.$emit('change');
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
