<template>
	<div class="g-reset"> 
		<slot />
	</div>
</template>
<script>
export default {
	name: "set-title",
	props: {
		title: String,
		isShowBack: {
			default: true,
			type: Boolean
		},
		offset: {
			type: Number,
			default: -45
		}
	},
	data() {
		return {
			path: this.$route.path
		};
	},
	computed: {
		
	},
	mounted() {
		document.title = this.title || document.title;
	},
	beforeDestroy() {
	},
	methods: {
		handleClick() {
			this.$router.back();
		}
	}
};
</script>
<style lang="scss" scoped>

</style>