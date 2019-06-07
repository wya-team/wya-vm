<template>
	<div class="vm-tools-preview">
		<div style="position: relative;">
			<div 
				v-for="(it) in dataSource" 
				:key="it.id" 
				:style="isDraggable ? { 
					position: 'absolute', 
					width: `${it.w ? `${it.w}px` : 'auto' }`, 
					height: `${it.h ? `${it.h}px` : 'auto' }`, 
					left: `${it.x}px`, 
					top: `${it.y}px`, 
					transform: `rotate(${it.r}deg)`
				} : {} "
			>
				<component
					:is="`vm-${it.module}-viewer`" 
					v-bind="it" 
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
		mode: String
	},
	data() {
		return {};
	},
	computed: {
		isDraggable() {
			return this.mode === 'draggable';
		}
	}
};

</script>
