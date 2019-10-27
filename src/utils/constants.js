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

export const RIGHT_MENU_MAP = {
	TOP: '置顶', 
	BOTTOM: '置底', 
	UP: '上移一层', 
	DOWN: '下移一层', 
	DELETE: '删除', 
};
