import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {DragDropContextProvider} from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import {createBrowserHistory} from 'history';
import App from './App';
import BlockPreview from './BlockPreview';
import {Auth0Provider} from './Auth0Provider';

const history = createBrowserHistory();

const onRedirectCallback = (appState: any) => {
	history.push(
		appState && appState.targetUrl
			? appState.targetUrl
			: window.location.pathname
	);
};

ReactDOM.render(
	<Auth0Provider
		domain={window.env.AUTH0_DOMAIN}
		clientId={window.env.AUTH0_CLIENTID}
		audience={window.env.AUTH0_AUDIENCE}
		redirectUri={window.location.origin}
		onRedirectCallback={onRedirectCallback}
		scope="openid email profile"
	>
		<DragDropContextProvider backend={TouchBackend({enableMouseEvents: true})}>
			<App/>
			<BlockPreview/>
		</DragDropContextProvider>
	</Auth0Provider>,
	document.getElementById('root') as HTMLElement
);
