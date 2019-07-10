<template>
	<div class="vm-tools-preview">
		<div style="position: relative;">
			<div 
				v-for="(it) in dataSource" 
				:key="it.id" 
				:style="isDraggable ? { 
					position: 'absolute', 
					width: `${it.w ? `${it.w * mult}px` : 'auto' }`, 
					height: `${it.h ? `${it.h * mult}px` : 'auto' }`, 
					left: `${it.x * mult}px`, 
					top: `${it.y * mult}px`, 
					transform: `rotate(${it.r}deg)`
				} : {} "
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
	name: 'vm-tools-preview',
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

		mult() {
			return typeof this.frameW === 'undefined' 
				? 1 
				: window.innerWidth / this.frameW;
		}
	}
};

</script>
