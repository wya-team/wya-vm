<template>
	<div>
		<div style="position: absolute; top: 0;" @click="handleClick">
			{{ theme }}
		</div>
		<vm-combo 
			v-model="list"
			:frame-style="{ border: '1px solid #5495f6', background: '#191C34' }"
			:style="style"
			:show-lines="false"
			:theme="theme"
			@save="handleSave"
			@error="handleError"
		/>
	</div>
</template>

<script>
import { createVMDrags } from '@wya/vm';
import { Message } from '@wya/vc';
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
					id: Math.random(),
					module: 'page',
					w: window.screen.width,
					h: window.screen.height,
				}
			],
			style: {},
			theme: 'dark'
		};
	},
	computed: {

	},
	mounted() {
		// 需要减去padding值
		this.style = {
			width: window.innerWidth - 40 + 'px',
			height: window.innerHeight - 40 + 'px',
		};
	},
	methods: {
		handleSave(response) {
			console.log(response, this.list);
		},
		handleError({ type, msg }) {
			Message.error(msg);
		},
		handleClick() {
			this.theme = this.theme === 'dark' ? 'light' : 'dark';
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
