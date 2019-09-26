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
									<vm-assist-customer
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
import Widget from '../../core/widget.vue';
import { hasOwn } from '../../utils/helper';
import { WIDGET_TO_FRAME } from '../../utils/constants';
import Assist from '../assist';

export default {
	name: 'vm-widget',
	components: {
		'vm-assist-customer': Assist.Customer,
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
			if (hasOwn(modules, key)) {
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
