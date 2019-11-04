<template>
	<div style="padding-top: 20px">
		<div style="position: absolute; top: 5px;">
			<vc-button @click="theme = theme === 'dark' ? 'light' : 'dark'">
				主题: {{ theme }}
			</vc-button>
			<vc-button @click="$refs.combo.preview()">
				预览
			</vc-button>
			<vc-button @click="$refs.combo.undo()">
				撤回
			</vc-button>
			<vc-button @click="$refs.combo.redo()">
				取消撤回
			</vc-button>
		</div>

		<!-- <vm-preview :data-source="list"/> -->
		<vm-combo 
			ref="combo"
			v-model="list"
			:frame-w="375"
			:frame-h="606"
			:show-assist="false"
			:width="style.width"
			:height="style.height"
			@save="handleSave"
			@error="handleError"
		/>
	</div>
</template>

<script>
import { createVMDrags } from '@wya/vm';
import { Message } from '@wya/vc';
import { Resize } from '@wya/vc/lib/utils/resize';

import { defaultModules } from './modules/root';

let { Combo, Preview } = createVMDrags(defaultModules, { mode: 'sortable' });

export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo
	},
	data() {
		return {
			list: [
				{
					id: Math.random(),
					module: 'page',
				}
			],
			style: {
				width: window.innerWidth - 40,
				height: window.innerHeight - 60,
			},
			theme: 'dark'
		};
	},
	computed: {
	},
	mounted() {
		Resize.on(document.body, this.handleResize);
	},
	destroyed() {
		Resize.off(document.body, this.handleResize);
	},
	methods: {
		handleResize() {
			// 需要减去padding值
			this.style = {
				width: window.innerWidth - 40,
				height: window.innerHeight - 60,
			};
		},
		handleSave(response) {
			console.log(response, this.list);
		},
		handleError({ type, msg }) {
			Message.error(msg);
		}
	},
};
</script>

<style lang="scss">
</style>
