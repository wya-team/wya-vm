<template>
	<component :is="tag" v-bind.sync="dataSource" />
</template>

<script>
import SyncNextC from './sync-next-c.vue';

export default {
	name: '',
	components: {
		"vc-sync-next-c": SyncNextC
	},
	props: {
		dataSource: Object, // 引用类型的数据可以跨层同步，基本类型不能跨层
		tag: {
			type: String,
			default: 'vc-sync-next-c'
		}
	},
	data() {
		return {
		};
	},
	created() {
	},
	methods: {
		handleClick() {
			
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
