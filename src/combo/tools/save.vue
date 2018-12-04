<template>
	<div id="vm-tools-save">
		<div @click="$emit('save')">保存</div>
		<div @click="$emit('preview')">预览</div>
	</div>
</template>

<script>
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
	methods: {
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
