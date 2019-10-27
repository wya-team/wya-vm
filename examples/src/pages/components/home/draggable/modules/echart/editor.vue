<template>
	<div style="display: flex; flex-direction: column;">
		<div style="padding: 20px">
			<span>大小：</span>
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

		<div style="padding: 20px">
			<span>位置：</span>
			<vc-input-number
				:value="$attrs.x"
				style="width: 88px; margin-right: 23px;"
				@input="handleChange(arguments[0], 'x')"
			/>
			<vc-input-number
				v-model="$attrs.y"
				style="width: 88px;"
				@input="handleChange(arguments[0], 'y')"
			/>
		</div>

		<div style="padding: 20px">
			<span>角度：</span>
			<vc-input-number
				:value="$attrs.r"
				style="width: 88px; margin-right: 23px;"
				@input="handleChange(arguments[0], 'r')"
			/>
		</div>

		<div style="padding: 20px">
			<span>层级：</span>
			<vc-input-number
				:value="$attrs.z"
				style="width: 88px; margin-right: 23px;"
				@input="handleChange(arguments[0], 'z')"
			/>
		</div>

		<div style="padding: 20px">
			<span>名字：</span>
			<vc-input
				:value="$attrs.name"
				style="width: 88px; margin-right: 23px;"
				@input="handleChange(arguments[0], 'name')"
			/>
		</div>
	</div>
</template>

<script>

export default {
	name: 'vm-echart-editor',
	components: {
	},
	// 以下两周都可行，相对的inheritAttrs比较好用的一点
	inheritAttrs: false,
	props: { },
	data() {
		return {};
	},
	computed: {
	},
	created() {
	},
	methods: {
		handleChange(e, key) {
			this.$emit('change', { [key]: e });
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
