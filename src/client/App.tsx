import * as React from 'react';
import {findDOMNode} from 'react-dom';
import {createStyles, WithStyles, withStyles, CircularProgress} from '@material-ui/core';
import cls from 'classnames';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import registerEvents from 'serviceworker-webpack-plugin/lib/browser/registerEvents';
import WebFont from 'webfontloader';
import PDFDocument from 'pdfkit-browserify';
import blobStream from 'blob-stream';
import FileSaver from 'file-saver';
import githubIcon from './github-32px.png';
import BlockList, {BlockData} from './BlockList';

const styles = createStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'center',
		height: '100%',
		backgroundColor: '#fafafa'
	},
	header: {
		display: 'flex',
		backgroundColor: '#ffffff',
		flex: '0 0 5rem',
		padding: '0 2rem',
		justifyContent: 'flex-start',
		alignItems: 'center',
		boxShadow: '0 0 0.6rem 0 #00000066',
		zIndex: 100,
		'& .outline': {
			marginRight: '1rem',
			minHeight: '2.6rem'
		},
		'@media only print': {
			display: 'none'
		}
	}	,
	content: {
		display: 'flex',
		justifyContent: 'center',
		flex: 1,
		overflowY: 'auto',
		overflowX: 'hidden',
		alignItems: 'baseline',
		'@media print': {
			overflowY: 'visible'
		}
	},
	uploadWrapper: {
		position: 'relative',
		overflow: 'hidden',
		minHeight: '2.4rem'
	},
	uploadLabel: {
		cursor: 'pointer',
		'& *': {
			pointerEvents: 'none'
		}
	},
	uploadInput: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: '6rem',
		height: '2.4rem',
		opacity: 0,
		zIndex: -1,
		cursor: 'pointer'
	},
	progressOverlay: {
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		backgroundColor: '#ffffffaa',
		zIndex: 500
	}
});

interface State {
	logs: string[];
	loaded: boolean;
	fontsLoaded: boolean;
	blocks: BlockData[];
	exporting: boolean;
}

const trimNewLines = (str: string) => {
	return str.replace(/(\n|\r)+$/, '').replace(/^(\n|\r)+/, '');
}

class App extends React.Component<WithStyles<typeof styles>, State> {
	public listRef = React.createRef<any>();

	public state: State = {
		logs: [],
		fontsLoaded: false,
		loaded: false,
		blocks: [],
		exporting: false
	};

	public componentDidMount() {
		if (
			'serviceWorker' in navigator &&
			window.location.protocol === 'https:'
			// Sw is disabled in localhost because of hmr
			// (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
		) {
			const registration = runtime.register();

			registerEvents(registration, {
				onInstalled: () => {
					this.pushLog('onInstalled');
				},
				onUpdateReady: () => {
					this.pushLog('onUpdateReady');
				},
				onUpdating: () => {
					this.pushLog('onUpdating');
				},
				onUpdateFailed: () => {
					this.pushLog('onUpdateFailed');
				},
				onUpdated: () => {
					this.pushLog('onUpdated');
				}
			});
		} else {
			this.pushLog('serviceWorker not available');
		}

		WebFont.load({
			google: {
				families: ['Montserrat:500,700', 'Roboto Mono:400,500']
			},
			active: () => {
				this.setState({fontsLoaded: true});
			}
		});

		const data = localStorage.getItem('outliner-data');
		if (data) {
			const blocks = JSON.parse(data);
			this.setState({blocks: blocks.filter(Boolean), loaded: true});
		}
	}

	public componentDidUpdate(_prevProps: any, prevState: State) {
		if (!prevState.fontsLoaded && this.state.fontsLoaded) {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					const elem = findDOMNode(this.listRef.current) as HTMLElement;
					if (elem) {
						elem.scrollTo(0, 0);
					}
				});
			}, 0);
		}
	}

	public pushLog = (log: string) => {
		this.setState({logs: [...this.state.logs, log]});
	}

	public handleBlocksChange = (blocks: BlockData[]) => {
		localStorage.setItem('outliner-data', JSON.stringify(blocks));
		this.setState({blocks});
	}

	public handleOpenFile = () => {
		const fileElem = document.getElementById('file') as HTMLInputElement | null;
		if (fileElem && fileElem.files && fileElem.files[0]) {
			const file = fileElem.files[0];
			const reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = () => {
				const data = reader.result as string;
				localStorage.setItem('outliner-data', data);
				this.setState({blocks: JSON.parse(data)});
			};
		}
	}

	public handleExportPDF = () => {
		this.setState({exporting: true}, () => {
			const ppi = 72;
			const pageWidth = 8.3 * ppi;
			const pageHeight = 11.7 * ppi;
			const indentWidth = 20;
			const margin = 0.5 * ppi;
			const blockMargin = 0.03 * ppi;
			const blockPadding = 0.1 * ppi;
			const borderRadius = 2;
			const fontSize = 8;
			const baseBlockTextWidth = pageWidth - (2 * margin) - (2 * blockPadding);
			const maxPageContentHeight = pageHeight - (2 * margin);

			const doc = new PDFDocument({size: 'a4', margin});
			const stream = doc.pipe(blobStream());
			doc.fontSize(fontSize);

			const roundedRect = (x: number, y: number, w: number, h: number, tl: number, tr: number, bl: number, br: number) => {
				return doc
					.moveTo(x + borderRadius, y)
					.lineTo(x + w - tr, y)
					.quadraticCurveTo(
						x + w, y,
						x + w, y + tr
					)
					.lineTo(x + w, y + h - br)
					.quadraticCurveTo(
						x + w, y + h,
						x + w - br, y + h
					)
					.lineTo(x + bl, y + h)
					.quadraticCurveTo(
						x, y + h,
						x, y + h - bl
					)
					.lineTo(x, y + tl)
					.quadraticCurveTo(
						x, y,
						x + tl, y
					);
			};

			let pageContentHeight = 0;

			for (const block of this.state.blocks) {
				const title = block.title.replace(/\t/g, '    ');
				const body = block.body.replace(/\t/g, '    ');
				const maxTextWidth = baseBlockTextWidth - (block.indent * indentWidth);
				const x = margin + (block.indent * indentWidth);
				let y = margin + pageContentHeight + blockMargin;

				const titleHeight = block.showTitle
					? doc.font('Courier-Bold').heightOfString(title, {width: maxTextWidth}) + (1.5 * blockPadding)
					: 0;
				const bodyHeight = block.showBody
					? doc.font('Courier').heightOfString(body, {width: maxTextWidth}) + (1.5 * blockPadding)
					: 0;
				const blockWidth = maxTextWidth + (2 * blockPadding);
				const blockHeight = titleHeight + bodyHeight;

				pageContentHeight += blockHeight + (2 * blockMargin);

				if (pageContentHeight > maxPageContentHeight) {
					doc.addPage();
					pageContentHeight = blockHeight + (2 * blockMargin);
					y = margin;
				}

				if (block.showTitle && block.showBody) {
					roundedRect(x, y, blockWidth, titleHeight, borderRadius, borderRadius, 0, 0)
						.fillOpacity(1)
						.fill(block.color);
					roundedRect(x, y + titleHeight, blockWidth, bodyHeight, 0, 0, borderRadius, borderRadius)
						.fillOpacity(0.5)
						.fill(block.color);
				} else if (block.showTitle) {
					roundedRect(x, y, blockWidth, titleHeight, borderRadius, borderRadius, borderRadius, borderRadius)
						.fillOpacity(1)
						.fill(block.color);
				} else if (block.showBody) {
					roundedRect(x, y + titleHeight, blockWidth, bodyHeight, borderRadius, borderRadius, borderRadius, borderRadius)
						.fillOpacity(1)
						.fill(block.color);
				}

				doc.fillOpacity(1).fill('#000000');

				if (block.showTitle) {
					doc
						.font('Courier-Bold')
						.text(title, x + blockPadding, y + blockPadding, {width: maxTextWidth});
				}
				if (block.showBody) {
					doc
						.font('Courier')
						.text(body, x + blockPadding, y + titleHeight + blockPadding, {width: maxTextWidth});
				}
			}

			doc.end();
			stream.on('finish', () => {
				const blob = stream.toBlob('application/pdf');
				FileSaver.saveAs(blob, 'outline.pdf');
				this.setState({exporting: false});
			});
		})
	}

	public handleExportText = () => {
		setTimeout(() => {
			window.requestAnimationFrame(() => {
				const blocks = this.state.blocks;
				const blockStrings = blocks.map(b => {
					const parts = [];
					if (b.showTitle) {
						parts.push(trimNewLines(b.title));
					}
					if (b.showBody) {
						parts.push(trimNewLines(b.body));
					}
					return parts.join('\n');
				});
				const str = blockStrings.join('\n\n\n');
				this.downloadData('outline.txt', str);
			});
		}, 0);
	}

	public handleSave = () => {
		this.downloadData('outline.otl', JSON.stringify(this.state.blocks));
	}

	public downloadData = (filename: string, data: string) => {
		const blob = new Blob(['\ufeff', data]);
		const el = document.createElement('a');
		el.href = window.URL.createObjectURL(blob);
		el.download = filename;
		document.body.appendChild(el);
		el.click();
		document.body.removeChild(el);
		window.URL.revokeObjectURL(el.href);
	}

	public render() {
		const {classes} = this.props;

		if (!this.state.fontsLoaded) {
			return (
				<div className={classes.progressOverlay}>
					<CircularProgress disableShrink/>
				</div>
			);
		}

		return (
			<div className={classes.root}>
				{this.state.exporting && (
					<div className={classes.progressOverlay}>
						<CircularProgress disableShrink/>
					</div>
				)}
				<div className={classes.header}>
					<div className={cls('outline', classes.uploadWrapper)}>
						<input className={classes.uploadInput} type="file" id="file" onChange={this.handleOpenFile}/>
						<label className={classes.uploadLabel} htmlFor="file">Open</label>
					</div>
					<button className="outline" onClick={this.handleSave}>
						Save
					</button>
					<button className="outline" onClick={this.handleExportPDF}>
						Export PDF
					</button>
					<button className="outline" onClick={this.handleExportText}>
						Export Text
					</button>
					<a
						href="https://github.com/olavim/outliner"
						target="outliner-github"
						style={{marginLeft: 'auto'}}
					>
						<img src={githubIcon}/>
					</a>
				</div>
				<div className={classes.content} ref={this.listRef}>
					<BlockList
						blocks={this.state.blocks}
						onChange={this.handleBlocksChange}
					/>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(App);
