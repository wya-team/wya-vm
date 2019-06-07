<template>
	<div @click="$emit('change', 1)">
		Name: {{ name }}
		<input type="text" >
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