<template>
	<div style="display: flex; flex-direction: column;">
		<div>
			<span>Name: </span>
			<input :value="$attrs.name" @input="handleChange($event, 'name')">
		</div>
		<div @click="handleClick">
			+ListItem
		</div>
	</div>
</template>

<script>

export default {
	name: 'vm-array-editor',
	components: {
	},
	// 以下两周都可行，相对的inheritAttrs比较好用的一点
	inheritAttrs: false,
	data() {
		return {
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
			let list = this.$attrs.list.slice(0);

			list.push({
				value: list.length,
				label: list.length
			});
			this.$emit('change', { list });
		}
	},
};
</script>

<style lang="scss">
input {
	border: 1px solid #000;
	margin: 10px;
}
</style>
