<template>
	<div id="vm-tools-save">
		<div @click="handleSave">保存</div>
		<div @click="handlePreview">预览</div>
	</div>
</template>

<script>
import { cloneDeep } from '../../utils/helper';
import { Preview } from './preview.vue';

export default {
	name: 'vm-tools-save',
	components: {
	},
	props: {
	},
	data() {
		return {
		};
	},
	computed: {

	},
	watch: {
		
	},
	created() {
	},
	destroyed() {
		Preview.hide();
	},
	methods: {
		handleSave() {
			const data = cloneDeep(this.$parent.dataSource) || [];

			if (data.length === 0) {
				this.$emit('save-error', `内容不能为空`);
				return;
			}
			const { modules } = this.$parent.$options;
			for (let i = 0; i < data.length; i++) {
				let { module: mod } = data[i];
				if (modules[mod].dataValidity) {
					let error = modules[mod].dataValidity(data[i]);
					if (error) {
						this.$emit('save-error', `第${i + 1}个 - ${error.error}`, i);
						return;
					}
				}
			}
			/**
			 * 数据验证
			 */
			this.$emit('save', data);
		},
		handlePreview() {
			if ( this.$parent.dataSource.length === 0 ) return;
			Preview.show({
				components: this.$parent.$options.viewers,
				dataSource: cloneDeep(this.$parent.dataSource),
				css: {
					style: {
						width: '500px',
						height: '500px'
					}
				}
			});
		}
	},
};
</script>

<style lang="scss" scoped>
#vm-tools-save {
	display: flex;
	cursor: pointer;
	align-items: center;
	user-select: none;
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		user-select: none;
	}
	.disabled {
		pointer-events: none;
		color: #ccc;
	}
}
</style>
