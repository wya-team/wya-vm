<template>
	<div style="display: flex; flex-direction: column;">
		<div style="padding: 20px">
			<span>屏幕大小：</span>
			<vc-input-number
				:value="$attrs.w"
				style="width: 88px; margin-right: 23px;"
				@input="handleChange(arguments[0], 'w')"
			/>
			<vc-input-number
				v-model="$attrs.h"
				style="width: 88px;"
				@input="handleChange(arguments[0], 'h')"
			/>
		</div>
	</div>
</template>

<script>

export default {
	name: 'vm-page-editor',
	components: {
	},
	// 以下两周都可行，相对的inheritAttrs比较好用的一点
	inheritAttrs: false,
	props: {},
	data() {
		return {};
	},
	computed: {
	},
	created() {
	},
	methods: {
		handleChange(v, key) {
			this.$emit('change', { [key]: v });
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
