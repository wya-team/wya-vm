<template>
	<div style="height: 200px">
		Name: {{ name }}
	</div>
</template>

<script>

export default {
	name: 'vm-array-viewer',
	components: {
	},
	props: {
		vm: {
			type: Object,
			default: () => ({})
		},
		id: String,
		name: [Number, String],
	},
	data() {
		return {
		};
	},
	computed: {
	},
	created() {
	},
	methods: {
		
	},
};
</script>