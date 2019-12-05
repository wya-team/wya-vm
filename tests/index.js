const testsContext = require.context('./__tpl__/', true, /\.test$/);
testsContext.keys().forEach(testsContext);
