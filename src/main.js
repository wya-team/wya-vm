import { defaultModules } from './modules/root';
import { cloneDeep } from './utils/helper';

import VMDraggable from './core/draggable.vue';
import VMFrame from './core/frame.vue';
import VMTools from './core/tools.vue';

export const Draggable = VMDraggable;
export const Frame = VMFrame;
export const Tools = VMTools;

export const vmRegister = (modules = defaultModules, opts = {}) => {
	try {
		let newDraggable = cloneDeep(VMDraggable);
		let newFrame = cloneDeep(VMFrame);
		let newTools = cloneDeep(VMTools);

		Object.keys(modules).forEach((item, index) => {
			let { Viewer, Editor } = modules[item]; 
			newFrame.components[`vm-${Viewer.module}-viewer`] = Viewer;
		});

		return {
			Draggable: newDraggable,
			Frame: newFrame,
			Tools: newTools,
		};
	} catch (e) {
		console.error(e);
		throw new Error(e);
	}
};


