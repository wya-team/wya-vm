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