<template>
	<div class="v-home-basic-main">
		<ul>
			<li v-for="(item, index) in list" v-if="String(index)" :key="index">
				<router-link :to="item.path">{{ item.name }}</router-link>
				<vc-copy :value="item.path" tag="span">复制</vc-copy>
			</li>
		</ul>
	</div>

</template>

<script>
import { homeConfig } from '@containers/home/app';

export default {
	name: 'tpl-links',
	components: {
	},
	data() {
		return {
			list: homeConfig,
		};
	},
	created() {
	},
	methods: {
	},
};
</script>

<style lang="scss">
.v-home-basic-main {
	li {
		padding: 5px;
	}
}
</style>
