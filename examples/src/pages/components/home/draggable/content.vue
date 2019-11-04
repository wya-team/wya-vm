<template>
	<div style="padding-top: 20px">
		<div style="position: absolute; top: 5px;">
			<vc-button @click="theme = theme === 'dark' ? 'light' : 'dark'">
				主题: {{ theme }}
			</vc-button>

			<vc-button @click="showRuler = !showRuler">
				标尺: {{ showRuler ? '展示' : '隐藏' }}
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

		<vm-combo 
			ref="combo"
			v-model="list"
			:frame-style="{ background: 'white' }"
			:frame-w="1920"
			:frame-h="1080"
			:width="style.width"
			:height="style.height"
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
				},
				{
					"w": 200,
					"h": 150,
					"r": 0,
					"x": 345,
					"y": 208,
					"z": 1,
					"name": "样式1",
					"bg": "#E6E8FF",
					"module": "echart",
					"id": "vm-15724918705191"
				}

			],
			style: {
				width: window.innerWidth - 40,
				height: window.innerHeight - 60,
			},
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

<style lang="scss" scoped>
</style>
