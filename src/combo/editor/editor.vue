<template>
	<component
		ref="target"
		:is="`vm-${dataSource.module}-editor`"
		v-bind.sync="dataSource" 
		class="vm-editor vm-hack-editor" 
		@change="handleChange"
	/>
</template>

<script>
import { valueIsNaN, hasOwn } from "../../utils/helper";

export default {
	name: 'vm-editor',
	components: {
	},
	props: {
		dataSource: Object
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
		/**
		 * hack操作
		 * 业务上避免使用该操作
		 */
		handleChange(opts = {}) {
			if (typeof opts !== 'object') return;
			for (let key in opts) {
				let val = opts[key];
				
				['x', 'y', 'z', 'r', 'w', 'h'].includes(key) && (val = Number(val));
				
				if (hasOwn(opts, key) && !valueIsNaN(val)) {

					this.$emit('change', { 
						type: 'update', 
						id: this.dataSource.id, 
						old: { 
							[key]: val 
						} 
					});
					this.$refs.target.$emit(`update:${key}`, val);
				}
			}

		}
	},
};
</script>

<style lang="scss" scoped>
</style>
