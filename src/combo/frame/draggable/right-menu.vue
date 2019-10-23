<template>
	<div
		v-show="visible"
		ref="vm-right-menu"
		:style="{
			left: `${event.clientX}px`,
			top: `${top}px`
		}"
		class="vm-right-menu"
	>
		<div class="vm-right-menu__content">
			<span
				v-for="item in menu"
				:key="item"
				class="vm-right-menu__item"
				@click="handleClick(item)"
				@mousedown.stop
			>
				{{ item }}
			</span>
		</div>
	</div>
</template>
<script>
import { Portal } from '../../../vc';

export const RIGHT_MENU_MAP = {
	TOP: '置顶', 
	BOTTOM: '置底', 
	UP: '上移一层', 
	DOWN: '下移一层', 
	DELETE: '删除', 
};

export const config = {
	name: 'vm-right-menu',
	props: {
		event: MouseEvent
	},
	data() {
		return {
			visible: false,
			wrapHeight: 175,
			menu: Object.keys(RIGHT_MENU_MAP).map((key) => RIGHT_MENU_MAP[key])
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
		handleClick(item) {
			this.visible = false;
			this.$emit('sure', item);
		}
	},
};

export default config;
export const RightMenu = new Portal(config);

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
