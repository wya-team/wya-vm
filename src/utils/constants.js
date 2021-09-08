// 注：保持一致，方便取值，空值判断

/**
 * 从组件控件拖入到视图时识别的 start-> setData 和 enter -> getData
 */
export const WIDGET_TO_FRAME = "@wya/vm";

/**
 * 在Frame排序拖拽时使用 start-> setData 和 enter -> getData
 */
export const SORT_IN_FRAME = "@wya/vm";

/**
 * 页面设置组件，由外部实现
 */
export const PAGE_MOULE = 'page';

/**
 * 组合功能，由内部实现
 */
export const SELECTION_MODULE = '@wya/vm/selection';

export const IS_SERVER = typeof window !== 'undefined';
export const DEBUG = process.env.NODE_ENV === 'development' || (IS_SERVER && window.location.search.includes('_vm_debug_'));

export const RIGHT_MENU_MAP = {
	TOP: 'TOP',
	BOTTOM: 'BOTTOM',
	UP: 'UP',
	DOWN: 'DOWN',
	DELETE: 'DELETE',
	SELECTION: 'SELECTION',
	LOCK: 'LOCK',
	COPY: 'COPY',
	PASTE: 'PASTE'
};

export const RIGHT_MENU_NAME_MAP = {
	TOP: '置顶',
	BOTTOM: '置底',
	UP: '上移一层',
	DOWN: '下移一层',
	DELETE: '删除',
	SELECTION: '取消组合',
	LOCK: it => (it.disabled ? '取消锁定' : '锁定'),
	COPY: '复制',
	PASTE: '粘帖',
};

// TODO: 集成图标
export const RIGHT_MENU_ICON_MAP = {
	TOP: 'p-top',
	BOTTOM: 'p-bottom',
	UP: 'p-move-up',
	DOWN: 'p-move-down',
	DELETE: 'p-delete2',
	SELECTION: 'p-line',
	LOCK: 'p-lock',
	COPY: 'p-order',
	PASTE: 'p-rotate-left',
};
