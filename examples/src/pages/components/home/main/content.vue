<template>
	<ul>
		<li v-for="(item, index) in list" v-if="String(index) && item.name" :key="index">
			<router-link :to="item.path">{{ item.name }}</router-link>
			<vc-copy :value="item.path" tag="span">复制</vc-copy>
		</li>
		<vc-sync :data-source.sync="dataSource" @change="handleChange"/>
		<vc-sync-next :data-source="dataSourceNext" />
		<div>
			{{ dataSourceNext }}
		</div>
	</ul>

</template>

<script>
import { Copy } from 'wya-vc';
import { homeConfig } from '@containers/home/app';
import Sync from './sync';
import SyncNext from './sync-next';

export default {
	name: 'tpl-links',
	components: {
		'vc-copy': Copy,
		'vc-sync': Sync,
		'vc-sync-next': SyncNext,
	},
	data() {
		return {
			list: homeConfig,
			dataSource: {},
			dataSourceNext: {
				x: 2
			}
		};
	},
	created() {
	},
	methods: {
		handleChange() {
			console.log(this.dataSource, 22);
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
