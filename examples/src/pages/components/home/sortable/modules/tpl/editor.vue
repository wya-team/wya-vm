<template>
	<div style="display: flex; flex-direction: column;">
		<div>name: <input :value="name" @input="handleChange($event, 'name')"></div>
	</div>
</template>

<script>

export default {
	name: 'vm-tpl-editor',
	components: {
	},
	// 以下两周都可行，相对的inheritAttrs比较好用的一点
	inheritAttrs: false,
	props: {
		// name: [Number, String],
	},
	data() {
		return {
			...this.$attrs
		};
	},
	computed: {
	},
	created() {
	},
	methods: {
		handleChange(e, key) {
			this.$emit('change', { [key]: e.target.value });
		},
		handleClick() {
			// this.$emit('update:x', this.x + 1);
			this.$emit('change', { x: this.x + 1 });
		}
	},
};
</script>

<style lang="scss">
</style>
