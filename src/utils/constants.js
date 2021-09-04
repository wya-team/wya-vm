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
 * 页面设置组件
 */
export const PAGE_MOULE = 'page';

/**
 * 组合功能
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
	// LOCK: 'LOCK'
};

export const RIGHT_MENU_NAME_MAP = {
	TOP: '置顶',
	BOTTOM: '置底',
	UP: '上移一层',
	DOWN: '下移一层',
	DELETE: '删除',
	SELECTION: '取消组合',
	// LOCK: '锁定'
};
