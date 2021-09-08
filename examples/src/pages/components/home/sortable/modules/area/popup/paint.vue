<template>
	<vc-modal
		v-model="visible"
		:mask-closable="false"
		title="绘制热区"
		size="large"
		class="vm-basic-area-paint"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<vc-button class="vm-hack-entry">
			测试：销毁editor（这样会导致change无法响应，因为被销毁了）
		</vc-button>
		<vc-button class="vm-hack-editor">
			测试：无法销毁
		</vc-button>
		<div>
			<br>
		</div>
		<div style="display: flex; align-items: flex-start; ">
			<vm-combo
				ref="combo"
				v-model="editorData"
				:frame-w="data.frameW"
				:frame-h="data.frameH"
				:width="data.frameW"
				:height="data.frameH"
				:show-widget="false"
				:show-editor="false"
				:show-lines="false"
				:show-ruler="false"
				:show-zoom-bar="false"
				:show-thumbnail="false"
				:frame-style="{
					'background-image': `url(${src})`,
					'background-size': '100%'
				}"
			/>
			<div class="vm-basic-area-paint__content">
				<div class="vm-basic-area-paint__operation">
					<vm-widget module="paint">
						<vc-button @click="handleAdd">
							添加热区
						</vc-button>
					</vm-widget>
					<span style="font-size: 12px; color: #999;">最多10个</span>
				</div>
				<div class="vm-basic-area-paint__list">
					<div
						v-for="(item, index) in editorData"
						:key="index"
						class="vm-basic-area-paint__item"
					>
						<span>热区{{ index + 1 }}：</span>
						<vc-icon
							type="clear"
							class="vm-basic-area-paint__close"
							@click="handleDelete(index)"
						/>
						<div>
							<vc-dropdown
								:portal="true"
								trigger="click"
								placement="right-bottom"
								portal-class-name="vm-hack-editor"
								@click="(name) => handleSelect(name, item)"
							>
								<a href="javascript:void(0)">
									<span style="color: #5495F6; cursor: pointer;">链接选择: {{ item.name }}</span>
								</a>
								<template #list>
									<vc-dropdown-menu>
										<vc-dropdown-item
											v-for="($item, $index) in page"
											:key="$index"
											:name="$item.value"
										>
											{{ $item.label }}
										</vc-dropdown-item>
									</vc-dropdown-menu>
								</template>
							</vc-dropdown>
						</div>
					</div>
				</div>
			</div>
		</div>
	</vc-modal>
</template>
<script>
import { Portal, Message } from '@wya/vc';
import { createVMDrags, Widget } from '@wya/vm';
import { paint } from './paint/root';

const { Combo } = createVMDrags({ paint });
const config = {
	name: 'vm-basic-area-paint',
	components: {
		'vm-combo': Combo,
		'vm-widget': Widget
	},
	props: {
		src: String,
		data: Object,
		list: Array
	},
	data() {
		return {
			visible: false,
			page: [
				{
					value: "1",
					label: '测试1'
				},
				{
					value: "2",
					label: '测试2'
				}
			],
			editorData: [],
		};
	},
	watch: {
		list: {
			immediate: true,
			handler(val) {
				setTimeout(() => {
					this.editorData = val;
				}, 301);
			}
		}
	},
	mounted() {
		this.visible = true;
	},
	methods: {
		handleSelect(value, item) {
			let it = this.page.find(i => i.value == value);
			item.route = `/${it.value}`;
			item.name = `/${it.label}`;
		},
		handleDelete(index) {
			this.editorData.splice(index, 1);
		},
		
		handleAdd() {
			this.$refs.combo.add('paint');
		},

		handleOk() {
			this.$emit('sure', this.editorData);
		},
		handleCancel() {
			this.$emit('close');
		}
	}
};

export default config;
export const Paint = new Portal(config, {
	onBefore(props) {
		Message.loading('数据处理中...');
		return new Promise(resolve => {
			let img = new Image();
			img.src = props.src;
			img.onload = () => {
				Message.destroy();
				resolve({
					data: {
						frameW: 500,
						frameH: (500 / img.naturalWidth) * img.naturalHeight
					}
				});
			};
		});
	}
});
</script>
<style lang="scss">
@import "~@wya/sass/lib/mixins/bem.scss";
@import "~@wya/sass/lib/mixins/common.scss";
$block: vm-basic-area-paint;
@include block($block) {
	@include element(content) {
		width: 100%;
		padding-left: 8px;
		@include element(operation) {
			padding-left: 8px;
			padding-bottom: 8px;
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			@include commonBorder1PX('bottom');
		}
		@include element(list) {
			padding-top: 15px;
			@include element(item) {
				width: 100%;
				padding: 10px 8px;
				display: flex;
				align-items: flex-start;
				border: 1px dashed #e8e8e8;
				margin-bottom: 15px;
				position: relative;
				@include element(close) {
					position: absolute;
					right: -8px;
					top: -8px;
					font-size: 16px;
					cursor: pointer;
					color: #999;
				}
			}
		}
	}
}

</style>
