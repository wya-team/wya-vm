<template>
	<div style="padding-top: 20px">
		<div style="position: absolute; top: 5px;">
			<vc-button @click="theme = theme === 'dark' ? 'light' : 'dark'">
				主题: {{ theme }}
			</vc-button>
			<vc-button @click="showRuler = !showRuler">
				标尺: {{ showRuler ? '展示' : '隐藏' }}
			</vc-button>
			<vc-button @click="showLines = !showLines">
				网格: {{ showLines ? '展示' : '隐藏' }}
			</vc-button>
			<vc-button @click="showZoomBar = !showZoomBar">
				视口大小: {{ showZoomBar ? '展示' : '隐藏' }}
			</vc-button>
			<vc-button @click="showThumbnail = !showThumbnail">
				缩略图: {{ showThumbnail ? '展示' : '隐藏' }}
			</vc-button>
			<vc-button @click="showSlots = !showSlots">
				头部/尾部(缩放为1时展示): {{ showSlots ? '展示' : '隐藏' }}
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
			<vc-button @click="loadData">
				重置
			</vc-button>
		</div>

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

import { defaultModules } from '../draggable/modules/root';

export default {
	name: 'tpl-links',
	components: {},
	data() {
		return {
			list: [],
			style: {
				width: window.innerWidth - 40,
				height: window.innerHeight - 60,
			},
			theme: 'dark',
			showRuler: true,
			showZoomBar: true,
			showThumbnail: true,
			showLines: false,
			showSlots: false,

			Combo: null
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
		this.Combo = createVMDrags(defaultModules).Combo;

		this.loadData();
	},
	destroyed() {
		Resize.off(document.body, this.handleResize);
	},
	methods: {
		loadData() {
			Message.loading('加载数据中');
			setTimeout(() => {
				this.list = [
					{
						id: `vc-page-15724918705193`,
						module: 'page',
						w: window.screen.width,
						h: window.screen.height,
					},
					{
						"w": 200,
						"h": 150,
						"r": 0,
						"x": 300,
						"y": 160,
						"z": 1,
						"name": "样式1",
						"bg": "#E6E8FF",
						"module": "echart",
						"id": "vm-15724918705191"
					},
					{
						"w": 200,
						"h": 150,
						"r": 0,
						"x": 345,
						"y": 208,
						"z": 2,
						"name": "样式2",
						"bg": "#FDE5E7",
						"module": "echart",
						"id": "vm-15724918705192"
					}
				];
				Message.destroy();
			}, 0);
		},
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
			// 
			return (
				<Combo 
					ref="combo"
					dataSource={this.list}
					frameW={1920}
					frameH={1080}
					frameStyle={{ background: 'white' }}
					width={this.style.width}
					height={this.style.height}
					showLines={this.showLines}
					showZoomBar={this.showZoomBar}
					showThumbnail={this.showThumbnail}
					showRuler={this.showRuler}
					theme={this.theme}
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

<style lang="scss" scoped>
</style>
