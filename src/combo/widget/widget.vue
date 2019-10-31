<template>
	<div :style="style" class="vm-widget">
		<div class="vm-widget__wrapper">
			<p class="vm-widget__header">组件库</p>
			<div v-if="showTip" class="vm-widget__tip">
				<span class="vm-widget__icon-warn">!</span>
				<p>可拖动数据组件到指定位置</p>
				<span @click="showTip = !showTip">✕</span>
			</div>
			<div class="vm-widget__menu">
				<div class="vm-widget__tabs">
					<p
						v-for="(item, key) in toolsList"
						v-if="key !== 'undefined'"
						:key="key"
						:class="{ 'is-active': currentTab == key}"
						@click="currentTab = key"
					>{{ key }}</p>
				</div>
				<div :style="contentStyle" class="vm-widget__content">
					<vm-widget-item
						v-for="(it) in toolsList[currentTab]"
						:key="it.module"
						:draggable="it.draggable"
						:module="it.module"
					>
						<!-- 组件标题 -->
						<div
							:class="{ 'is-active': it.active, 'is-draggable': it.draggable, 'is-click': it.widgets }"
							class="vm-widget__title"
							@click="it.widgets && (it.active = !it.active)"
						>
							<p v-if="typeof it.component === 'string'" v-html="it.component"/>
							<component v-else :is="`vm-${it.module}-widget`" v-on="handleEvent(it.module)"/>
							<div v-if="it.widgets" class="vm-widget__arrow" />
						</div>
						<!-- 子元素 -->
						<div v-if="it.active" class="vm-widget__combo">
							<vm-widget-item
								v-for="(widget, index) in it.widgets"
								:key="index"
								:module="it.module"
								:index="index"
								draggable
								class="vm-widget__item"
							>
								<template v-if="widget.render">
									<vc-customer
										:render="widget.render"
										:index="index"
									/>
								</template>
								<template v-else>
									<img :src="widget.image" >
									<p>{{ widget.name }}</p>
								</template>
							</vm-widget-item>
						</div>
					</vm-widget-item>
				</div>
			</div>


		</div>
	</div>
</template>

<script>
import Widget from '../../base/widget.vue';
import { hasOwn } from '../../utils/helper';
import { WIDGET_TO_FRAME } from '../../utils/constants';
import { Customer } from '../../vc';

export default {
	name: 'vm-widget',
	components: {
		'vc-customer': Customer,
		'vm-widget-item': Widget,
	},
	props: {
		width: Number,
		height: Number,
		type: {
			type: String,
			default: 'free' // sort-list
		},
		dataSource: Array,
		contentStyle: Object
	},
	data() {
		const { modules } = this.$parent.$options;
		let toolsList = {};
		for (let key in modules) {
			// 过滤页面设置
			if (hasOwn(modules, key) && modules[key].type !== 'basic') {
				let item = modules[key];
				let type = item.type || 'undefined';
				if (!toolsList[type]) {
					toolsList[type] = [];
				}
				if (item.showWidget || typeof item.showWidget === 'undefined') {
					toolsList[type].push({
						module: item.module,
						component: item.Widget || item.name,
						widgets: item.widgets,
						// 最外层拖拽
						draggable: !!(!item.widgets && item.Viewer && item.Editor),

						// 更多, 由click事件控制
						active: false
					});
				}
			}
		}
		return {
			toolsList,
			showTip: true,
			currentTab: Object.keys(toolsList)[0]
		};
	},
	computed: {
		style() {
			const w = this.width === 0 ? 'auto' : `${this.width}px`;
			const h = this.height === 0 ? 'auto' : `${this.height}px`;

			return {
				width: w,
				height: h
			};
		}
	},
	created() {
		// console.log(this.$options.modules);
	},
	methods: {
		handleEvent(module) {
			return {
				change: (...rest) => this.$emit('change', module, ...rest)
			};
		}
	},
};
</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-widget;
$tabs-w: 48px;
$content-w: 236px;
$w: $tabs-w + $content-w;

@include block($block) {
	flex: 0 0 $w;
	width: $w;
	z-index: 10;
	@include element(wrapper) {
		background: $white;
		padding: 10px 0 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}
	@include element(header) {
		font-size: 15px;
		color: #000;
		padding: 8px 15px;
		font-weight: 400;
	}
	@include element(tip) {
		background: #FDF5E8;
		height: 40px;
		margin: 2px 9px 15px;
		display: flex;
		align-items: center;
		padding: 0 10px;
		color: $assit;
		border-radius: 4px;
		border:none;
		p {
			flex: 1;
		}
		span {
			color: $assit;
			cursor: pointer;
		}
	}
	@include element(icon-warn) {
		width: 14px;
		height: 14px;
		background: #EC9C39;
		border-radius: 100%;
		color: $white;
		font-size: 12px;
		line-height: 14px;
		text-align: center;
		margin-right: 7px;
	}
	@include element(menu) {
		border-top: 1px solid $border;
		overflow-y: auto;
		display: flex;
		flex:1;
		justify-content: space-between;
		align-items: stretch;
		flex-wrap: nowrap;
	}
	@include element(tabs) {
		width: $tabs-w;
		height: 100%;
		padding: 0;
		color: $assit;
		display: flex;
		line-height: 24px;
		font-size: 12px;
		border-right: 1px solid $border;
		justify-content: flex-start;
		flex-direction: column;
		@include scroller();
		p {
			text-align: center;
			height: 49px;
			cursor: pointer;
			line-height: 49px;
			&.is-active {
				color: $black;
				background-color: $acitved;
			}
		}
	}
	@include element(content) {
		width: $content-w;
		overflow: auto;
		height: 100%;
		@include scroller();
	}

	@include element(title) {
		padding: 15px 12px;
		font-size: 12px;
		color: #000;
		// font-weight: bold;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		border-bottom: 1px solid $border;
		@include when(draggable) {
			cursor: move;
		}
		@include when(click) {
			cursor: pointer;
		}
		@include when(active) {
			color: $primary;
			.vm-widget__arrow {
				transform: rotate(-135deg);
			}
		}
	}
	@include element(arrow) {
		width: 8px;
		height: 8px;
		border: 2px solid $border;
		border-top: 0;
		border-left: 0;
		transform: rotate(45deg);
		transition: transform 0.2s ease-in-out;
	}
	@include element(combo) {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		border-bottom: 1px solid $border;
		// justify-content: center;
		padding: 12px;
	}
	@include element(item) {
		flex: 0 0 50%;
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 6px 12px;
		cursor: move;
		img {
			width: 100%;
			// border: 1px dashed $border;
		}
		p {
			padding-top: 8px;
		}
	}
}

</style>
