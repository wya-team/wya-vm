import Vue from 'vue';
import HistoryMixin from './history-mixin';
import EditorMixin from './editor-mixin';

export default Vue.extend({
	mixins: [HistoryMixin, EditorMixin], 
	data() {
		return {
			states: {
				data: [],
			}
		};
	},

	computed: {
		
	},

	methods: {
		/**
		 * TODO: 方法API
		 */
	}
});
