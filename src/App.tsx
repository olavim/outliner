import * as React from 'react';
import './App.css';
import BlockList, {BlockData} from './BlockList';

interface State {
	blocks: BlockData[];
}

class App extends React.Component<{}, State> {
	public state: State = {
		blocks: [
			{
				id: 1,
				title: 'Sequence',
				body: '',
				showTitle: true,
				showBody: false,
				color: '#ffcc88',
				indent: 0
			},
			{
				id: 2,
				title: 'Kohtaus 1',
				body: 'Lauri ajaa tuhatta ja sataa',
				showTitle: true,
				showBody: true,
				color: '#00ddff',
				indent: 0
			},
			{
				id: 3,
				title: '',
				body: 'Pelkkää tekstiä',
				showTitle: false,
				showBody: true,
				color: '#00ddff',
				indent: 1
			}
		]
	};

	public handleBlocksChange = (blocks: BlockData[]) => {
		this.setState({blocks});
	}

	public handleOpenFile = () => {
		Dropbox.choose({
			success: (files: any[]) => {
				fetch(files[0].link).then(res => {
					return res.json();
				}).then(json => {
					console.log(json);
				});
			},
			linkType: 'direct',
			extensions: ['otl']
		});
	}

	public handleSaveFile = () => {
		Dropbox.save();
	}

	public render() {
		return (
			<div className="App">
				<div className="App-header">
					<button className="outline" onClick={this.handleOpenFile}>
						open
					</button>
					<button className="outline" onClick={this.handleSaveFile}>
						save
					</button>
				</div>
				<div className="App-content">
					<BlockList blocks={this.state.blocks} onChange={this.handleBlocksChange}/>
				</div>
			</div>
		);
	}
}

export default App;
