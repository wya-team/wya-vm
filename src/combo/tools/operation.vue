<template>
	<div id="vm-tools-operation">
		<div 
			:class="{ disabled: current === 0 }" 
			@click="handleUndo"
		>←</div>
		<div 
			:class="{ disabled: current === total }" 
			@click="handleRedo"
		>→</div>
		<div 
			:class="{ disabled: !isEdit }" 
			@click="handleDelete"
		>✕</div>
		<span>
			cur: {{ current }}
			last: {{ total }}
		</span>
	</div>
</template>

<script>

export default {
	name: 'vm-tools-operation',
	components: {
	},
	props: {
		total: Number,
		current: Number,
		isEdit: Boolean
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
		},
		handleDelete() {
			this.$emit('delete');
		}
	},
};
</script>

<style lang="scss" scoped>
#vm-tools-operation {
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
