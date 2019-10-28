<template>
	<div>
		<div style="position: absolute; top: 0;" @click="theme = theme === 'dark' ? 'light' : 'dark'">
			主题: {{ theme }} (点我切换)
		</div>

		<div style="position: absolute; top: 0; left: 200px" @click="showRuler = !showRuler">
			标尺: {{ showRuler ? '展示' : '隐藏' }} (点我切换)
		</div>

		<vm-combo 
			v-model="list"
			:frame-style="{ border: '1px solid #5495f6', background: 'white' }"
			:frame-w="1920"
			:frame-h="1080"
			:style="style"
			:show-lines="false"
			:show-ruler="showRuler"
			:theme="theme"
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

let { Combo, Preview } = createVMDrags(defaultModules);

export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo,
	},
	data() {
		return {
			list: [
				{
					id: `vc-page-${Math.random()}`,
					module: 'page',
					w: window.screen.width,
					h: window.screen.height,
				}
			],
			style: {},
			theme: 'dark',
			showRuler: true
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
				width: window.innerWidth - 40 + 'px',
				height: window.innerHeight - 40 + 'px',
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

<style lang="scss" scoped>
</style>
