<template>
	<div>
		<div @click="handleClick">{{ x }}</div>
	</div>
</template>

<script>

export default {
	name: '',
	components: {
	},
	props: {
		x: Number
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
		handleClick() {
			this.$emit('update:x', this.x + 1);
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
