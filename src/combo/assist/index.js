import { COMPONENTS_MAP } from './components/index';
import { MIXINS_MAP } from './mixins/index';

const Assist = {
	components: (select = []) => select.map(key => COMPONENTS_MAP[key]).filter(i => !!i),
	mixins: (select = []) => select.map(key => MIXINS_MAP[key]).filter(i => !!i)
};

export { Assist };

