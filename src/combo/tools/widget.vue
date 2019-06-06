<template>
	<div :style="style" class="vm-tools-widget">
		<div v-for="(item, key) in toolsList" :key="key">
			<div v-if="key !== 'undefined'" class="__title">
				{{ key }}		
			</div>
			<div 
				v-for="(it) in item" 
				:key="it.module" 
				class="__item" 
				draggable 
				@dragstart="handleStart($event, it.module)"
			>
				<span v-if="typeof it.component === 'string'">{{ it.component }}</span>
				<component v-else :is="`vm-${it.module}-widget`"/>
			</div>
		</div>
	</div>
</template>

<script>
import { hasOwn } from '../../utils/helper';
import { WIDGET_TO_FRAME } from '../constants';

export default {
	name: 'vm-tools-widget',
	components: {
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
					component: item.Widget || item.name
				});
			}
		}
		return {
			toolsList
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
		handleStart(e, item) {
			e.dataTransfer.setData(WIDGET_TO_FRAME, item);
		}
	},
};
</script>