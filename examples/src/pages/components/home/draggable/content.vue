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
			<vc-button @click="handleDownload">
				下载
			</vc-button>
			<vc-button @click="handleUpload">
				上传
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
			:show-lines="showLines"
			:show-zoom-bar="showZoomBar"
			:show-thumbnail="showThumbnail"
			:show-ruler="showRuler"
			:theme="theme"
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
import { Message, Modal } from '@wya/vc';
import { Resize } from '@wya/vc/lib/utils/resize';
import moment from 'moment';

import { defaultModules } from './modules/root';

let { Combo, Preview } = createVMDrags(defaultModules);

export default {
	name: 'tpl-links',
	components: {
		'vm-combo': Combo,
	},
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
			showSlots: false
		};
	},
	computed: {

	},
	mounted() {
		this.loadData();
		Resize.on(document.body, this.handleResize);
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
		handleDownload() {
			const content = JSON.stringify(this.list, null, '\t');
			const blob = new Blob([content], {
				type: 'application/json;charset=UTF-8'
			});

			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.textContent = 'download json';
			link.href = url;
			link.download = 'data'; // moment().format('YYYY-MM-DD')
			link.click();

			URL.revokeObjectURL(url);
		},
		handleUpload() {
			Modal.info({
				title: '文件上传',
				content: '上传JSON数据将覆盖当前画布，确认上传？',
				onOk: () => {
					const input = document.createElement('input');
					input.type = 'file';
					// 限定文件类型
					input.accept = '.json';
					input.click();

					input.onchange = () => {
						const file = input.files[0];

						// FileReader实例
						const reader = new FileReader();
						reader.readAsText(file, 'UTF-8');
						reader.onload = e => {
							try {
								this.list = JSON.parse(e.target.result);
								// TODO: check rules
							} catch (e) {
								console.log(e);
							}
						};
					};
				}
			});
		}
	},
};
</script>

<style lang="scss" scoped>
</style>
