<template>
	<div style="padding-top: 20px">
		<div style="position: absolute; top: 5px;">
			<vc-button @click="theme = theme === 'dark' ? 'light' : 'dark'">
				主题: {{ theme }}
			</vc-button>
			<vc-button @click="showSlots = !showSlots">
				头部/尾部: {{ showSlots ? '展示' : '隐藏' }}
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
			keyboard-enabled
			@save="handleSave"
			@error="handleError"
		>
			<template v-if="showSlots" #frame-header>
				<div>header</div>
			</template>
			<template v-if="showSlots" #frame-footer>
				<div>footer</div>
			</template>
		</vm-combo>
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
				},
				{
					id: 'A',
					module: 'tpl',
					name: `名称_A`,
				},
				{
					id: 'B',
					module: 'tpl',
					name: `名称_B`,
				},
				{
					id: 'C',
					module: 'tpl',
					name: `名称_C`,
				}
			],
			style: {
				width: window.innerWidth - 40,
				height: window.innerHeight - 60,
			},
			theme: 'dark',
			showSlots: false
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
