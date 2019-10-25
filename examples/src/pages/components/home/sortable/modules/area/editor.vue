<template>
	<div class="vm-basic-area-editor">
		<div
			class="vm-basic-arer-editor__content"
			style="padding-top: 20px; padding-left: 10px;"
		>
			<vc-button
				:disabled="!$attrs.src"
				type="primary"
				@click="handleClick"
			>
				绘制热区
			</vc-button>
		</div>
	</div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { Paint } from "./popup/paint";

export default {
	name: 'vm-basic-area-editor',
	inheritAttrs: false,
	methods: {
		handleClick() {
			Paint.popup({
				src: this.$attrs.src,
				list: this.positionTransform(this.$attrs.list, 375, 500)
			}).then((res) => {
				this.$emit('change', { list: this.positionTransform(res) });
			}).catch((res) => {
				console.log(res);
			});
		},
		positionTransform(list, old = 500, now = 375) {
			return cloneDeep(list).map(item => {
				item.x = (item.x / old) * now;
				item.y = (item.y / old) * now;
				item.w = (item.w / old) * now;
				item.h = (item.h / old) * now;
				return item;
			});
		}
	},
};
</script>

<style lang="scss">
</style>
