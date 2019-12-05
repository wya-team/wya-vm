import Comp from './component';
import { createVue } from '../helper';

describe('Comp', () => {
	it('vue', () => {
		expect(typeof Comp).to.equal('object');
		expect(typeof Comp.data()).to.equal('object');
		expect(typeof Comp.created()).to.equal('undefined');
	});
});