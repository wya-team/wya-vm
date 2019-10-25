<template>
	<div style="display: flex; flex-direction: column;" class="v-x">
		<div>w: <input :value="$attrs.w" @input="handleChange($event, 'w')"></div>
		<div>h: <input :value="$attrs.h" @input="handleChange($event, 'h')"></div>
		<div>x: <input :value="$attrs.x" @input="handleChange($event, 'x')"></div>
		<div>y: <input :value="$attrs.y" @input="handleChange($event, 'y')"></div>
		<div>z: <input :value="$attrs.z" @input="handleChange($event, 'z')"></div>
		<div>r: <input :value="$attrs.r" @input="handleChange($event, 'r')"></div>
		<div>name: <input :value="$attrs.name" @input="handleChange($event, 'name')"></div>
	</div>
</template>

<script>

export default {
	name: 'vm-array-editor',
	components: {
	},
	// 以下两周都可行，相对的inheritAttrs比较好用的一点
	inheritAttrs: false,
	props: {
		// w: Number,
		// h: Number,
		// r: Number,
		// x: Number,
		// y: Number,
		// z: Number,
		// name: [Number, String],
	},
	data() {
		return { };
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
.v-x {
	input {
		border: 1px solid #000;
		margin: 10px;
	}
}
</style>
