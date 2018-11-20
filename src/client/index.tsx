import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {DragDropContextProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend'
import App from './App';

ReactDOM.render(
	<DragDropContextProvider backend={HTML5Backend}>
		<App/>
	</DragDropContextProvider>,
	document.getElementById('root') as HTMLElement
);
