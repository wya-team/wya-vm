import { defaultModules } from './modules/root';
import { cloneDeep } from '../utils/helper';
import Combo from './combo.vue';
import Frame from './frame';
import Widget from './widget';
import Editor from './editor';
import Preview, { PreviewManager } from './preview';

export default (modules = defaultModules, opts = {}) => {
	const { mode = "draggable" } = opts;
	try {
		let newCombo = cloneDeep(opts.Combo || Combo);
		let newFrame = cloneDeep(opts.Frame || (mode === 'draggable' ? Frame.Draggable : Frame.Sortable));
		let newWidget = cloneDeep(opts.Widget || Widget);
		let newPreview = cloneDeep(opts.Preview || Preview);
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

		newWidget.components = {
			...newWidget.components,
			...widgets
		};

		newCombo.components = {
			...newCombo.components,
			'vm-frame': newFrame,
			'vm-editor': newEditor,
			'vm-widget': newWidget,
		};

		newPreview.components = {
			...newPreview.components,
			...viewers
		};


		// cloneDeep 避免相互干扰，vue内部会改变_Ctor缓存
		let rebuildCombo = cloneDeep(newCombo);
		let rebuildPreview = cloneDeep(newPreview);

		let manager = new PreviewManager(newPreview, mode);

		rebuildCombo.previewManager = manager;

		rebuildPreview.show = manager.show;
		rebuildPreview.hide = manager.hide;

		return {
			Combo: rebuildCombo,
			Preview: rebuildPreview
		};
	} catch (e) {
		console.error(`[wya-vm/register]`, e);
		throw new Error(e);
	}
};
