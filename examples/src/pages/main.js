import '../css/global.scss';
import 'iview/dist/styles/iview.css';
// <link rel="stylesheet" href="//unpkg.com/iview/dist/styles/iview.css" />

if (process.env.NODE_ENV !== "production") {
	require('./routers/router.dev');
} else {
	require('./routers/router.dist');
}

