<template>
	<div class="v-home-basic-main">
		<ul>
			<template v-for="(item, index) in list">
				<li v-if="String(index)" :key="index">
					<router-link :to="item.path">
						{{ item.name }}
					</router-link>
					<vc-clipboard :value="item.path" tag="span">
						复制
					</vc-clipboard>
				</li>
			</template>
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
