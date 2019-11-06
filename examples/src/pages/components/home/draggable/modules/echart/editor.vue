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
				:value="$attrs.h"
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
				:value="$attrs.y"
				style="width: 88px;"
				@input="handleChange(arguments[0], 'y')"
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
			<span>角度 - 失焦修改：</span>
			<br>
			<vc-input-number
				v-model="currenR"
				style="width: 88px; margin-right: 23px;"
				@blur="handleChange(arguments[0], 'r')"
			/>
		</div>

		<div style="padding: 20px">
			<span>Name - 失焦修改：</span>
			<br>
			<vc-input
				v-model="currentName"
				style="width: 88px; margin-right: 23px;"
				@blur="handleChange(arguments[0], 'name')"
			/>
		</div>

		<div style="padding: 20px">
			<span>Name - 失焦异步修改：</span>
			<br>
			<vc-input
				v-model="currentAsyncName"
				style="width: 88px; margin-right: 23px;"
				@blur="handleChangeDelay(arguments[0], 'name')"
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
	props: {
		name: String,
		r: Number
	},
	data() {
		return {
			currentName: '',
			currentAsyncName: '',
			currenR: '',
		};
	},
	watch: {
		name: {
			immediate: true,
			handler(v) {
				this.currentName = v;
				this.currentAsyncName = v;
			}
		},
		r: {
			immediate: true,
			handler(v) {
				this.currenR = v;
			}
		}
	},
	created() {
	},
	methods: {

		handleChange(e, key) {
			let v = typeof e === 'object' ? e.target.value : e;
			this.$emit('change', { [key]: v });
		},

		handleChangeDelay(e, key) {
			setTimeout(() => {
				let v = typeof e === 'object' ? e.target.value : e;
				this.$parent.emitChange(this.$attrs.id, { [key]: v });
			}, 2000);
		}
	},
};
</script>

<style lang="scss">
</style>
