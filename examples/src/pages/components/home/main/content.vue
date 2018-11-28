<template>
	<ul>
		<li v-for="(item, index) in list" v-if="String(index) && item.name" :key="index">
			<router-link :to="item.path">{{ item.name }}</router-link>
			<vc-copy :value="item.path" tag="span">复制</vc-copy>
		</li>
		<vc-sync :data-source="dataSource" @change="handleChange"/>
	</ul>

</template>

<script>
import { Copy } from 'wya-vc';
import { homeConfig } from '@containers/home/app';
import Sync from './sync';

export default {
	name: 'tpl-links',
	components: {
		'vc-copy': Copy,
		'vc-sync': Sync
	},
	data() {
		return {
			list: homeConfig,
			dataSource: []
		};
	},
	created() {
	},
	methods: {
		handleChange() {
			console.log(this.dataSource);
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
