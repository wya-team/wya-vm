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
		<vc-customer :render="renderAsync">
			<template v-if="showSlots" #frame-header>
				<div>header</div>
			</template>
			<template v-if="showSlots" #frame-footer>
				<div>footer</div>
			</template>
		</vc-customer>
	</div>
</template>

<script>
import { createVMDrags } from '@wya/vm';
import { Message } from '@wya/vc';
import { Resize } from '@wya/vc/lib/utils/resize';

import { defaultModules } from '../sortable/modules/root';

export default {
	name: 'tpl-links',
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
			theme: 'dark',
			showSlots: false,

			Combo: null,
			Preview: null
		};
	},
	async mounted() {
		Resize.on(document.body, this.handleResize);

		// 这里可以处理模块异步
		Message.loading('模块异步加载中....');
		await this.$request({
			localData: {
				status: 1
			},
			delay: 3
		});
		Message.destroy();
		this.Combo = createVMDrags(defaultModules, { mode: 'sortable' }).Combo;
		
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
		},
		renderAsync(h, props, parent) {
			let { Combo, Preview } = this;

			if (!Combo) return null;
			// v-model -> dataSource + onChange
			// @save -> onSave
			// @error -> onError
			// slot -> scopedSlots
			return (
				<Combo 
					ref="combo"
					dataSource={this.list}
					frameW={375}
					frameH={606}
					width={this.style.width}
					height={this.style.height}
					keyboardEnabled={true}
					onSave={this.handleSave}
					onError={this.handleError}
					onChange={(list) => this.list = list}
					scopedSlots={parent.scopedSlots}
				/>	
			);
		}
	},
};
</script>

<style lang="scss">
</style>
