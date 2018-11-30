<template>
	<div class="vm-tools-operation">
		<div 
			:class="{ disabled: currentStep === 0 }" 
			@click="handleUndo"
		>←</div>
		<div 
			:class="{ disabled: currentStep === lastStep }" 
			@click="handleRedo"
		>→</div>
		cur: {{ currentStep }}
		last: {{ lastStep }}
	</div>
</template>

<script>

export default {
	name: 'vm-tools-widget',
	components: {
	},
	props: {
		lastStep: Number,
		currentStep: Number,
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
		handleUndo() {
			this.$emit('undo');
		},
		handleRedo() {
			this.$emit('redo');
		}
	},
};
</script>

<style lang="scss" scoped>
.vm-tools-operation {
	display: flex;
	cursor: pointer;
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
	}
	.disabled {
		pointer-events: none;
		color: #ccc;
	}
}
</style>
