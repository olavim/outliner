import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {DragDropContextProvider} from 'react-dnd';
import TouchBackend from 'react-dnd-touch-backend';
import App from './App';
import BlockPreview from './BlockPreview';

ReactDOM.render(
	<DragDropContextProvider backend={TouchBackend({enableMouseEvents: true})}>
		<App/>
		<BlockPreview/>
	</DragDropContextProvider>,
	document.getElementById('root') as HTMLElement
);
