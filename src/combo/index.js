import { defaultModules } from './modules/root';
import { cloneDeep, kebabCase } from '../utils/helper';
import { PAGE_MOULE } from '../utils/constants';
import Combo from './combo.vue';
import Frame from './frame';
import Widget from './widget';
import Editor from './editor';
import { Assist } from './assist';
import { Portal } from '../vc';

const [Preview, PreviewPopup] = Assist.components(['Preview', 'PreviewPopup']);

export default (modules = defaultModules, opts = {}) => {
	const { mode = "draggable" } = opts;
	try {
		Object.keys(modules).forEach(item => {
			if (modules[item].module === PAGE_MOULE) {
				modules[item].data = {
					...cloneDeep(
						typeof modules[item].data === 'function'
							? modules[item].data(0, modules)
							: modules[item].data,
					),
					draggable: false,
					closeable: false,
					resizable: false,
					rotatable: false
				};
			}
		});
		let newCombo = cloneDeep(opts.Combo || Combo);
		let newFrame = cloneDeep(opts.Frame || (mode === 'draggable' ? Frame.Draggable : Frame.Sortable));
		let newWidget = cloneDeep(opts.Widget || Widget);
		let newPreview = cloneDeep(opts.Preview || Preview);
		let newEditor = cloneDeep(opts.Editor || Editor);

		let viewers = {};
		let editors = {};
		let widgets = {};

		Object.keys(modules).forEach((item, index) => {
			let cName = kebabCase(item); // fooBar -> foo-bar
			let { Viewer: _Vditor, Editor: _Editor, Widget: _Widget } = modules[item];
			viewers[`vm-${cName}-viewer`] = _Vditor;
			editors[`vm-${cName}-editor`] = _Editor;
			widgets[`vm-${cName}-widget`] = _Widget;
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

		let previewManager = new Portal(PreviewPopup, {
			mode,
			promise: false,
			components: {
				'vm-preview': newPreview
			}
		});

		rebuildPreview.popup = previewManager.popup;
		rebuildPreview.destroy = previewManager.destroy;
		rebuildCombo.previewManager = previewManager;

		return {
			Combo: rebuildCombo,
			Preview: rebuildPreview
		};
	} catch (e) {
		console.error(`[wya-vm/register]`, e);
		throw new Error(e);
	}
};
