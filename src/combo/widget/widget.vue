<template>
	<div :style="style" class="vm-widget">
		<div class="vm-widget__wrapper">
			<p class="vm-widget__title">组件库</p>
			<div v-if="showTip" class="vm-widget__tip" @click="showTip = !showTip">
				<p>拖拽添加组件，点击修改样式</p>
				<span>✕</span>
			</div>
			<div class="vm-widget__tabs">
				<p 
					v-for="(item, key) in toolsList" 
					v-if="key !== 'undefined'"
					:key="key"
					:class="{ 'is-active': currentTab == key}"
					@click="currentTab = key"
				>{{ key }}</p>		
			</div>
			<div 
				v-for="(it) in toolsList[currentTab]" 
				:key="it.module" 
				:draggable="!it.widgets"
				@dragstart="!it.widgets && handleStart($event, it.module)"
			>
				<!-- 组件标题 -->
				<div 
					:class="{ 'is-active': it.active, 'is-draggable': !it.widgets }" 
					class="vm-widget__title"
					@click="it.widgets && (it.active = !it.active)"
				>
					<p v-if="typeof it.component === 'string'" v-html="it.component"/>
					<component v-else :is="`vm-${it.module}-widget`"/>
					<div 
						v-if="it.widgets"
						class="vm-widget__arrow"
					/>
				</div>
				<!-- 子元素 -->
				<div v-if="it.active" class="vm-widget__combo">
					<div 
						v-for="(widget, index) in it.widgets" 
						:key="index" 
						draggable
						class="vm-widget__item"
						@dragstart="handleStart($event, it.module, index)"
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
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasOwn } from '../../utils/helper';
import { WIDGET_TO_FRAME } from '../constants';
import Assist from '../assist';

export default {
	name: 'vm-widget',
	components: {
		'vm-assist-customer': Assist.Customer
	},
	props: {
		width: Number,
		height: Number,
		type: {
			type: String,
			default: 'free' // sort-list
		},
		dataSource: Array
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

				toolsList[type].push({
					module: item.module,
					component: item.Widget || item.name,
					widgets: item.widgets,
					active: false
				});
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
		handleStart(e, module, index) {
			console.log(JSON.stringify({
				module,
				index
			}), /2/);
			e.dataTransfer.setData(
				WIDGET_TO_FRAME, 
				JSON.stringify({
					module,
					index
				})
			);
		}
	},
};
</script>