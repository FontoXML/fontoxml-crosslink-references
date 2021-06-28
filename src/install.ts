import nodeHighlightManager from 'fontoxml-focus-highlight-view/src/nodeHighlightManager';
import uiManager from 'fontoxml-modular-ui/src/uiManager';
import DocumentPreviewModal from './ui/DocumentPreviewModal';

export default function install(): void {
	// TODO: use some FDS "selection color" constant?
	nodeHighlightManager.styleAsSelectionHighlight('target-element', '#fdd835');

	uiManager.registerReactComponent(
		'DocumentPreviewModal',
		DocumentPreviewModal
	);
}
