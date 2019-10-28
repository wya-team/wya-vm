/**
 * roots
 */
import { tpl } from './tpl/root';
import { array } from './array/root';
import { setting } from './setting/root';
import { area } from './area/root';

export const defaultModules = {
	tpl,
	array,
	setting,
	area,
	page: {
		module: 'page',
		Viewer: {
			render() {
				return null;
			}
		},
		Editor: {
			render() {
				return (
					<div>随意</div>
				);
			}
		}
	}
};
