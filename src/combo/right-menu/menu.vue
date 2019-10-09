<template>
	<div
		ref="vm-right-menu"
		:style="{
			left: `${event.clientX}px`,
			top: `${top}px`
		}"
		class="vm-right-menu"
	>
		<transition name="vm-fade">
			<div v-show="visible" class="vm-right-menu__content">
				<span
					v-for="item in menu"
					:key="item.value"
					class="vm-right-menu__item"
					@click="$emit('click', item)"
					@mousedown.stop
				>
					{{ item.label }}
				</span>
			</div>
		</transition>
	</div>
</template>
<script>
export default {
	name: 'right-menu',
	props: {
		event: MouseEvent
	},
	data() {
		return {
			visible: false,
			wrapHeight: 175,
			menu: [{
				label: '置顶',
				value: 1
			}, {
				label: '置底',
				value: 2
			}, {
				label: '上移一层',
				value: 3
			}, {
				label: '下移一层',
				value: 4
			}, {
				label: '删除',
				value: 5
			}]
		};
	},
	computed: {
		top() {
			return (window.innerHeight - this.event.clientY) < this.wrapHeight
				? (this.event.clientY - this.wrapHeight) : this.event.clientY;
		}
	},
	mounted() {
		this.visible = true;
	},
	methods: {

	},
};
</script>
<style lang="scss">
.vm-right-menu {
	position: fixed;
	z-index: 999;
	width: 104px;
	background: #444;
	padding: 6px 0px;
	border: 1px solid #47DAFF;
	border-radius:4px;
	.vm-right-menu__content {
		display: flex;
		flex-direction: column;
		align-items: center;
		.vm-right-menu__item {
			height: 32px;
			width: 100%;
			line-height: 32px;
			text-align: center;
			display: block;
			color: #fff;
			cursor: pointer;
			&:hover {
				background: #343434;
				color: #16F2F6;
			}
		}
	}
}
</style>
