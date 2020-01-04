import {BlockData} from '@/BlockList';
import PDFDocument from '@/lib/vendor/pdfkit.standalone';
import blobStream from 'blob-stream';
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
	private pageContentHeight: number = 0;

	constructor(opts: PDFOptions) {
		this.options = opts;
	}

	private nextPage = () => {
		if (this.doc.bufferedPageRange().count - 1 > this.page) {
			this.doc.switchToPage(this.page + 1);
		} else {
			this.doc.addPage();
		}
		this.page++;
	}

	private setPage = (page: number) => {
		this.doc.switchToPage(page);
		this.page = page;
	}

	private roundedRect = (
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
		const multiPage = y + height + margin > pageHeight;

		// Start from bottom left
		const startY = multiPage ? pageHeight : y + height - bottomLeft;
		const endY = multiPage ? 0 : startY;

		let path = this.doc.moveTo(x, startY)
			// Line to top left
			.lineTo(x, y + topLeft)
			.quadraticCurveTo(x, y, x + topLeft, y)
			// Line to top right
			.lineTo(x + width - topRight, y)
			.quadraticCurveTo(x + width, y, x + width, y + topRight)

		// Line to bottom right (stop at page end)
		if (multiPage) {
			path = path.lineTo(x + width, pageHeight);
		} else {
			path = path.lineTo(x + width, y + height - bottomRight);
		}

		// While path doesn't fit in current page
		while (y + height + margin > pageHeight + Math.max(bottomLeft, bottomRight)) {
			if (closePath) {
				path = path.closePath();
			}

			pathCallback(path);
			this.nextPage();

			// Remove height we used in previous page
			height -= pageHeight - y - margin;
			y = margin;

			// If remaining path doesn't fit in current page
			if (y + height + margin > pageHeight + Math.max(bottomLeft, bottomRight)) {
				// Line from top left to bottom left
				path = this.doc.moveTo(x, 0).lineTo(x, pageHeight);

				if (closePath) {
					path = path.lineTo(x + width, pageHeight);
				} else {
					pathCallback(path);
					path = this.doc.moveTo(x + width, pageHeight);
				}

				// Line from bottom right to top right
				path = path.lineTo(x + width, 0);
			} else {
				// Line to bottom right
				path = this.doc.moveTo(x + width, 0).lineTo(x + width, margin + height - bottomRight);
			}
		}

		path = path
			.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height)
			// Line to bottom left
			.lineTo(x + bottomLeft, y + height)
			.quadraticCurveTo(x, y + height, x, y + height - bottomLeft)
			.lineTo(x, endY);

		if (closePath) {
			path = path.closePath();
		}

		pathCallback(path);
	};

	private text = (str: string, x: number, y: number, textOpts: any) => {
		const {margin, pageHeight} = this.options;
		const lineHeight = this.doc.currentLineHeight();

		this.doc.fillOpacity(1)
			._text(str, x, y, textOpts, (line: string, opts: any) => {
				let overflowHeight = y + lineHeight + margin - pageHeight;

				// Start new page if text would overflow
				if (overflowHeight > 0) {
					this.nextPage();
					y = margin;
				}

				this.doc.fillOpacity(1).fill(opts.fill)._fragment(line, x, y, opts);
				y += lineHeight;
			});

		return y;
	}

	private addContent = (blockHeight: number, simulate: boolean = false) => {
		const {pageHeight, margin, blockMargin, blockPadding} = this.options;
		const lineHeight = this.doc.currentLineHeight();
		const maxPageContentHeight = pageHeight - (2 * margin);
		let pageContentHeight = this.pageContentHeight;
		let contentStart = margin + this.pageContentHeight + blockMargin;
		let totalBlockHeight = blockHeight + (2 * blockMargin);

		if (pageContentHeight === 0) {
			totalBlockHeight -= blockMargin;
			contentStart -= blockMargin;
		}

		pageContentHeight += totalBlockHeight;

		// If we need to split content, recalculate height of remaining page content on new page
		if (totalBlockHeight > maxPageContentHeight) {
			let newHeight = totalBlockHeight - (pageHeight - contentStart - margin) - blockMargin;
			while (newHeight > maxPageContentHeight) {
				newHeight -= maxPageContentHeight;
			}
			pageContentHeight = newHeight;
		}

		const firstLineOverflow = contentStart + blockPadding + lineHeight + margin > pageHeight;

		// Add block on new page if it would overflow
		if (firstLineOverflow || pageContentHeight > maxPageContentHeight) {
			if (!simulate) {
				this.nextPage();
			}

			// Do not add top margin for first block of page
			pageContentHeight = blockHeight + blockMargin;
			contentStart = margin;
		}

		if (!simulate) {
			this.pageContentHeight = pageContentHeight;
		}

		return contentStart;
	}

	private realTextHeight = (str: string, font: Buffer, y: number, opts: any) => {
		const {margin, pageHeight} = this.options;
		const textHeight = this.doc.font(font).heightOfString(str, opts);
		const lineHeight = this.doc.currentLineHeight();

		let lines = Math.round(textHeight / lineHeight);
		let height = 0;

		while (lines > 0) {
			let overflowHeight = y + lineHeight + margin - pageHeight;

			if (overflowHeight > 0) {
				y = margin;
				height += lineHeight - overflowHeight;
			}

			y += lineHeight;
			height += lineHeight;
			lines--;
		}

		return {height, contentStart: y};
	}

	private renderBlock = (block: BlockData) => {
		const {pageWidth, pageHeight, margin, indentWidth, blockPadding, blockMargin, borderRadius} = this.options;
		const baseBlockTextWidth = pageWidth - (2 * margin) - (2 * blockPadding);

		// PDFKit doesn't support tabs
		const title = block.title.replace(/\t/g, '    ');
		const body = block.body.replace(/\t/g, '    ');
		const maxTextWidth = baseBlockTextWidth - (block.indent * indentWidth);
		const blockWidth = maxTextWidth + (2 * blockPadding);

		let titleTextHeight = this.doc.font(titleFont).heightOfString(title, {width: maxTextWidth});
		let titleHeight = block.showTitle ? titleTextHeight + (2 * blockPadding) : 0;

		let bodyTextHeight = this.doc.font(bodyFont).heightOfString(body, {width: maxTextWidth});
		let bodyHeight = block.showBody ? bodyTextHeight + (2 * blockPadding) : 0;

		let blockHeight = titleHeight + bodyHeight;

		const blockFitsInOnePage = blockHeight + (2 * blockMargin) < pageHeight - (2 * margin);

		if (!blockFitsInOnePage) {
			let y = this.addContent(0, true);

			({height: titleTextHeight, contentStart: y} =
				this.realTextHeight(title, titleFont, y + blockPadding, {width: maxTextWidth}));
			titleHeight = block.showTitle ? titleTextHeight + (2 * blockPadding) : 0;

			({height: bodyTextHeight} =
				this.realTextHeight(body, bodyFont, y + (2 * blockPadding), {width: maxTextWidth}));
			bodyHeight = block.showBody ? bodyTextHeight + (2 * blockPadding) : 0;

			blockHeight = titleHeight + bodyHeight;
		}

		const x = margin + (block.indent * indentWidth);
		const y = this.addContent(blockHeight);

		const origPage = this.page;

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
				(path: any) => path.fillOpacity(block.showTitle ? 1 : 0.5).fill(block.color)
			);
		}

		this.setPage(origPage);

		this.roundedRect(
			x, y,
			blockWidth, blockHeight,
			borderRadius, borderRadius, borderRadius, borderRadius,
			false,
			(path: any) => path.lineWidth(0.1).stroke('#666')
		);

		this.setPage(origPage);

		let bodyY = y + titleHeight;

		if (block.showTitle) {
			this.doc.font(titleFont);
			const nextLineY = this.text(title, x + blockPadding, y + blockPadding, {
				width: maxTextWidth,
				fill: '#000000'
			});
			bodyY = nextLineY + blockPadding;
		}

		if (block.showBody) {
			this.doc.font(bodyFont);
			this.text(body, x + blockPadding, bodyY + blockPadding, {
				width: maxTextWidth,
				fill: '#000000'
			});
		}
	}

	public export = (blocks: BlockData[]): Promise<Blob> => {
		return new Promise(resolve => {
			const {margin, fontSize, pageWidth, pageHeight} = this.options;

			this.doc = new PDFDocument({
				size: [pageWidth, pageHeight],
				margin,
				bufferPages: true
			});

			this.stream = this.doc.pipe(blobStream());
			this.page = 0;

			this.stream.on('finish', () => {
				const blob = this.stream.toBlob('application/pdf');
				resolve(blob);
			});

			this.doc.fontSize(fontSize);

			blocks.forEach(this.renderBlock);

			this.doc.end();
		});
	}
}
