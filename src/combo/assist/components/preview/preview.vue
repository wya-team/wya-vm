<template>
	<div class="vm-assist-preview">
		<div style="position: relative;">
			<div 
				v-for="(it) in dataSource" 
				:key="it.id" 
				:style="isDraggable ? { 
					position: 'absolute', 
					width: `${it.w ? `${it.w * scale}px` : 'auto' }`, 
					height: `${it.h ? `${it.h * scale}px` : 'auto' }`, 
					left: `${it.x * scale}px`, 
					top: `${it.y * scale}px`, 
					transform: `rotate(${it.r}deg)`
				} : {} "
				@click.alt.exact="handleClick(it.id)"
			>
				<component
					:is="`vm-${it.module}-viewer`" 
					v-bind="it"
					:vm="vm"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'vm-assist-preview',
	provide() {
		return {
			getCtx: () => this
		};
	},
	components: {
		
	},
	props: {
		dataSource: Array,
		mode: String,
		frameW: Number
	},
	data() {
		return {
			vm: {
				type: 'preview'
			}
		};
	},
	computed: {
		isDraggable() {
			return this.mode === 'draggable';
		},

		scale() {
			return typeof this.frameW === 'undefined' 
				? 1 
				: window.innerWidth / this.frameW;
		}
	},
	created() {
		this.isWatch = false;
		this.currentId = '';
	},
	methods: {
		/**
		 * 用于debug
		 */
		handleClick(id) {
			this.currentId = this.currentId === id ? null : id;
			if (this.isWatch) return;

			this.isWatch = true;
			this.$watch('dataSource', (v) => {

				if (!this.currentId) return;

				console.log('\n----');
				console.log(new RegExp(new Date().toString()));
				console.log(JSON.parse(JSON.stringify(v.find(i => i.id === this.currentId))));
				console.log('----\n\n');

			}, { deep: true, immediate: true });
		}
	}
};
</script>
