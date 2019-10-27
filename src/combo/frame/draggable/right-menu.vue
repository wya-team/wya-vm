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
import { RIGHT_MENU_MAP } from '../../../utils/constants';
import { $ } from '../../../utils/helper';

export const config = {
	name: 'vm-right-menu',
	props: {
		event: MouseEvent,
		onSelect: {
			type: Function,
			default() {
				return () => {};
			}
		}
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
		this.operateDOMEvents('add');
	},

	destroyed() {
		this.operateDOMEvents('remove');
	},
	methods: {
		handleClick(item) {
			this.visible = false;
			this.onSelect(item);

			this.$emit('close');
		},

		operateDOMEvents(type) {
			let fn = type === 'add' 
				? document.documentElement.addEventListener 
				: document.documentElement.removeEventListener;

			fn('click', this.handleDeselect);
		},

		handleDeselect(e) {
			let path = e.path || e.composedPath() || [];
			let inArea = path.some(el => el === this.$el || el === this.event.target);

			if (!inArea) {
				this.visible = false;
				this.$emit('close');
			}
		}
	},
};

export default config;
export const RightMenu = new Portal(config, { promise: false });

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
