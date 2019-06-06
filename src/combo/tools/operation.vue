<template>
	<div class="vm-tools-operation vm-hack-editor">
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
