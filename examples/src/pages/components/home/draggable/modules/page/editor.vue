<template>
	<div style="display: flex; flex-direction: column;">
		<div>w: <input :value="w" @input="handleChange($event, 'w')"></div>
		<div>h: <input :value="h" @input="handleChange($event, 'h')"></div>
	</div>
</template>

<script>

export default {
	name: 'vm-page-editor',
	components: {
	},
	// 以下两周都可行，相对的inheritAttrs比较好用的一点
	inheritAttrs: false,
	props: {
		w: Number,
		h: Number,
	},
	data() {
		return {};
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
