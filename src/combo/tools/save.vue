<template>
	<div class="vm-tools-save vm-hack-editor">
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