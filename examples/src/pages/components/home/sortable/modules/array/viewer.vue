<template>
	<div style="height: 200px">
		<div>
			Name: {{ name }}
		</div>
		<div>
			list: {{ list }}
		</div>
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
		list: Array,
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