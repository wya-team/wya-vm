<template>
	<div>
		Name: {{ name }}
	</div>
</template>

<script>

export default {
	name: 'vm-tpl-viewer',
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