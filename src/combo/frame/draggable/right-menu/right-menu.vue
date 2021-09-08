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
			<div
				v-for="item in menu"
				:key="item"
				class="vm-right-menu__item"
				@click="handleClick(item)"
				@mousedown.stop
			>
				<vc-icon
					:type="icons[item]"
					class="vm-right-menu__icon"
				/>
				<span>
					{{ typeof menuName[item] === 'function' ? menuName[item](dataSource) : menuName[item] }}
				</span>
			</div>
		</div>
	</div>
</template>
<script>
import { Portal, Icon } from '../../../../vc';
import { RIGHT_MENU_MAP, RIGHT_MENU_NAME_MAP, RIGHT_MENU_ICON_MAP } from '../../../../utils/constants';
import { $ } from '../../../../utils/helper';

export default {
	name: 'vm-right-menu',
	components: {
		'vc-icon': Icon
	},
	props: {
		event: MouseEvent,
		dataSource: {
			type: Object,
			default: () => ({})
		},
		// 用于右键过滤显示元素
		filter: {
			type: Function,
			default() {
				return () => true;
			}
		},
		icons: {
			type: Object,
			default: () => {
				return RIGHT_MENU_ICON_MAP;
			}
		}
	},
	data() {
		return {
			visible: false,
			wrapHeight: 175,
			menuName: RIGHT_MENU_NAME_MAP,
			menu: Object.keys(RIGHT_MENU_MAP).map((key) => RIGHT_MENU_MAP[key]).filter(this.filter)
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
			this.$emit('sure', item);
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

</script>
<style lang="scss">
.vm-right-menu {
	position: fixed;
	z-index: 1999;
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
			display: block;
			color: #fff;
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding-left: 14px;
			cursor: pointer;
			&:hover {
				background: #343434;
				color: #16F2F6;
			}
		}
		.vm-right-menu__icon {
			font-size: 12px;
			margin-right: 8px;
		}

	}
}
</style>
