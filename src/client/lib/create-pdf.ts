import {BlockData} from '@/BlockList';
import PDFDocument from 'pdfkit-browserify';
import blobStream from 'blob-stream';
import FileSaver from 'file-saver';
import RobotoMono from '../fonts/RobotoMono-Regular.ttf';
import RobotoMonoMedium from '../fonts/RobotoMono-Medium.ttf';

const RobotoMonoData = /^data:.+;base64,(.*)$/.exec(RobotoMono)![1];
const RobotoMonoMediumData = /^data:.+;base64,(.*)$/.exec(RobotoMonoMedium)![1];
const titleFont = new Buffer(RobotoMonoMediumData, 'base64');
const bodyFont = new Buffer(RobotoMonoData, 'base64');

interface PDFOptions {
	pageWidth: number;
	pageHeight: number;
	indentWidth: number;
	margin: number;
	blockMargin: number;
	blockPadding: number;
	borderRadius: number;
	fontSize: number;
}

export default class PDF {
	private options: PDFOptions;
	private doc: any = null;
	private stream: any = null;
	private page: number = 0;

	constructor(opts: PDFOptions) {
		this.options = opts;
	}

	nextPage = () => {
		if (this.doc.bufferedPageRange().count - 1 > this.page) {
			this.doc.switchToPage(this.page + 1);
		} else {
			this.doc.addPage();
		}
		this.page++;
	}

	previousPage = () => {
		if (this.page > 0) {
			this.doc.switchToPage(this.page - 1);
			this.page--;
		}
	}

	roundedRect = (
		x: number,
		y: number,
		width: number,
		height: number,
		topLeft: number,
		topRight: number,
		bottomLeft: number,
		bottomRight: number,
		closePath: boolean,
		pathCallback: (path: any) => any
	) => {
		const {margin, pageHeight} = this.options;

		// We might need multiple paths if rect overflows page
		const origPage = this.page;
		const multiPage = y + height + margin > pageHeight;

		// Start from bottom left
		const startY = multiPage ? pageHeight : y + height - bottomLeft;
		const endY = multiPage ? 0 : startY;

		let path = this.doc.moveTo(x, startY)
			// Line to top left
			.lineTo(x, y + topLeft)
			.quadraticCurveTo(
				x, y,
				x + topLeft, y
			)
			// Line to top right
			.lineTo(x + width - topRight, y)
			.quadraticCurveTo(
				x + width, y,
				x + width, y + topRight
			)

		// Line to bottom right (stop at page end)
		if (multiPage) {
			path = path.lineTo(x + width, pageHeight);
		} else {
			path = path.lineTo(x + width, y + height - bottomRight);
		}

		// While path doesn't fit in current page
		while (y + height + margin > pageHeight) {
			if (closePath) {
				path = path.closePath();
			}

			pathCallback(path);
			this.nextPage();

			// Remove height we used in previous page
			height -= pageHeight - y - margin;
			y = 0;

			// If remaining path doesn't fit in current page
			if (y + height + margin > pageHeight) {
				// Line from top left to bottom left
				path = this.doc.moveTo(x, y).lineTo(x, pageHeight);

				if (closePath) {
					path = path.lineTo(x + width, pageHeight);
				} else {
					pathCallback(path);
					path = this.doc.moveTo(x + width, pageHeight);
				}

				// Line from bottom right to top right
				path = path.lineTo(x + width, y);
			} else {
				// Line to bottom right
				path = this.doc.moveTo(x + width, y).lineTo(x + width, y + margin + height - bottomRight);
			}

			y = margin;
		}

		path = path
			.quadraticCurveTo(
				x + width, y + height,
				x + width - bottomRight, y + height
			)
			// Line to bottom left
			.lineTo(x + bottomLeft, y + height)
			.quadraticCurveTo(
				x, y + height,
				x, y + height - bottomLeft
			)
			.lineTo(x, endY);

		if (closePath) {
			path = path.closePath();
		}

		pathCallback(path);
		this.doc.switchToPage(origPage);
		this.page = origPage;
	};

	export = (blocks: BlockData[]) => {
		return new Promise(resolve => {
			const {pageWidth, pageHeight, margin, fontSize, indentWidth, blockMargin, blockPadding, borderRadius} = this.options;
			const baseBlockTextWidth = pageWidth - (2 * margin) - (2 * blockPadding);
			const maxPageContentHeight = pageHeight - (2 * margin);

			this.doc = new PDFDocument({size: 'a4', margin, bufferPages: true});
			this.stream = this.doc.pipe(blobStream());
			this.page = 0;

			this.stream.on('finish', () => {
				const blob = this.stream.toBlob('application/pdf');
				FileSaver.saveAs(blob, 'outline.pdf');
				resolve();
			});

			this.doc.fontSize(fontSize);

			let pageContentHeight = 0;

			blocks.forEach((block, index) => {
				const title = block.title.replace(/\t/g, '    ');
				const body = block.body.replace(/\t/g, '    ');
				const maxTextWidth = baseBlockTextWidth - (block.indent * indentWidth);
				const x = margin + (block.indent * indentWidth);
				let y = margin + pageContentHeight + blockMargin;

				const titleTextHeight = this.doc.font(titleFont).heightOfString(title, {width: maxTextWidth});
				const bodyTextHeight = this.doc.font(bodyFont).heightOfString(body, {width: maxTextWidth});
				const titleHeight = block.showTitle ? titleTextHeight + (2 * blockPadding) : 0;
				const bodyHeight = block.showBody ? bodyTextHeight + (2 * blockPadding) : 0;
				const blockWidth = maxTextWidth + (2 * blockPadding);
				const blockHeight = titleHeight + bodyHeight;

				pageContentHeight += blockHeight + (2 * blockMargin);

				if (index === 0) {
					// Remove top margin for first block
					y -= blockMargin;
					pageContentHeight -= blockMargin;
				}

				// If we need to split content, recalculate height of remaining page content on new page
				if (blockHeight + (2 * blockMargin) > maxPageContentHeight) {
					let newHeight = blockHeight + (2 * blockMargin) - (pageHeight - y - margin);
					while (newHeight > maxPageContentHeight) {
						newHeight -= maxPageContentHeight;
					}
					pageContentHeight = newHeight;
				}

				// Add block on new page if it would overflow
				if (pageContentHeight > maxPageContentHeight) {
					this.nextPage();
					// Do not add top margin for first block of page
					pageContentHeight = blockHeight + blockMargin;
					y = margin;
				}

				if (block.showTitle && block.showBody) {
					// Draw two separate rectangles because of different colors

					this.roundedRect(
						x, y,
						blockWidth, titleHeight,
						borderRadius, borderRadius, 0, 0,
						true,
						(path: any) => path.fillOpacity(1).fill(block.color)
					);
					this.roundedRect(
						x, y + titleHeight,
						blockWidth, bodyHeight,
						0, 0, borderRadius, borderRadius,
						true,
						(path: any) => path.fillOpacity(0.5).fill(block.color)
					);
				} else {
					this.roundedRect(
						x, y,
						blockWidth, block.showTitle ? titleHeight : bodyHeight,
						borderRadius, borderRadius, borderRadius, borderRadius,
						true,
						(path: any) => path.fillOpacity(1).fill(block.color)
					);
				}

				this.roundedRect(
					x, y,
					blockWidth, blockHeight,
					borderRadius, borderRadius, borderRadius, borderRadius,
					false,
					(path: any) => path.lineWidth(0.1).stroke('#666')
				);

				// Reset font color
				this.doc.fillOpacity(1).fill('#000000');

				if (block.showTitle) {
					this.doc
						.font(titleFont)
						.text(title, x + blockPadding, y + blockPadding, {width: maxTextWidth});
				}
				if (block.showBody) {
					const lineHeight = this.doc.currentLineHeight();
					let curY = y + titleHeight + blockPadding;

					this.doc
						.fillOpacity(1)
						.fill('#000000')
						.font(bodyFont)
						._text(body, x + blockPadding, curY, {width: maxTextWidth}, (line: string, opts: any) => {
							this.doc
								.fillOpacity(1)
								.fill('#000000')
								._fragment(line.replace(/\n/g, '') || 'asd', x + blockPadding, curY, opts);

							curY += lineHeight;

							if (curY + lineHeight + margin > pageHeight) {
								const overflowHeight = curY + lineHeight + margin - pageHeight;
								this.nextPage();
								curY = margin - overflowHeight;
							}
						});
				}
			});

			this.doc.end();
		});
	}
}
