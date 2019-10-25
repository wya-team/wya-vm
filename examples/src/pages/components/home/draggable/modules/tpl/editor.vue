<template>
	<div style="display: flex; flex-direction: column;">
		{{ x }}
		<div>w: <input :value="w" @input="handleChange($event, 'w')"></div>
		<div>h: <input :value="h" @input="handleChange($event, 'h')"></div>
		<div>x: <input :value="x" @input="handleChange($event, 'x')"></div>
		<div>y: <input :value="y" @input="handleChange($event, 'y')"></div>
		<div>z: <input :value="z" @input="handleChange($event, 'z')"></div>
		<div>r: <input :value="r" @input="handleChange($event, 'r')"></div>
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
		w: Number,
		h: Number,
		r: Number,
		x: Number,
		y: Number,
		z: Number,
		name: [Number, String],
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
