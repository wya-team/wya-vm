import { defaultModules } from './modules/root';
import { cloneDeep } from '../utils/helper';
import { DraggableFrame, SortListFrame } from './frame/root';
import Combo from './combo.vue';
import ToolsWidget from './tools/widget.vue';
import ToolsPreview from './tools/preview.vue';
import Editor from './editor/editor.vue';

export default (modules = defaultModules, opts = {}) => {
	const { mode = "draggable" } = opts;
	try {
		let newCombo = cloneDeep(opts.Combo || Combo);
		let newFrame = cloneDeep(opts.Frame || (mode === 'draggable' ? DraggableFrame : SortListFrame));
		let newToolsWidget = cloneDeep(opts.ToolsWidget || ToolsWidget);
		let newToolsPreview = cloneDeep(opts.ToolsPreview || ToolsPreview);
		let newEditor = cloneDeep(opts.Editor || Editor);

		let viewers = {};
		let editors = {};
		let widgets = {};
		
		Object.keys(modules).forEach((item, index) => {
			let { Viewer: _Vditor, Editor: _Editor, Widget: _Widget } = modules[item]; 
			viewers[`vm-${item}-viewer`] = _Vditor;
			editors[`vm-${item}-editor`] = _Editor;
			widgets[`vm-${item}-widget`] = _Widget;
		});
		// $options
		newCombo.modules = modules;
		newCombo.viewers = viewers;
		newCombo.editors = editors;

		// components
		newFrame.components = {
			...newFrame.components,
			...viewers
		};
		newEditor.components = {
			...newEditor.components,
			...editors
		};

		newToolsWidget.components = {
			...newToolsWidget.components,
			...widgets
		};

		newCombo.components = {
			...newCombo.components,
			'vm-frame': newFrame,
			'vm-editor': newEditor,
			'vm-tools-widget': newToolsWidget,
		};

		newToolsPreview.components = {
			...newToolsPreview.components,
			...viewers
		};
		// cloneDeep 避免相互干扰，vue内部会改变_Ctor缓存
		return {
			Combo: cloneDeep(newCombo),
			Preview: cloneDeep(newToolsPreview)
		};
	} catch (e) {
		console.error(`[wya-vm/register]`, e);
		throw new Error(e);
	}
};
