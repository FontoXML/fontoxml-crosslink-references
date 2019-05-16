import nodeHighlightManager from 'fontoxml-focus-highlight-view/src/nodeHighlightManager.js';
import uiManager from 'fontoxml-modular-ui/src/uiManager.js';
import DocumentPreviewModal from './ui/DocumentPreviewModal.jsx';

export default function install() {
	// TODO: use some FDS "selection color" constant?
	nodeHighlightManager.styleAsSelectionHighlight('target-element', '#fdd835');

	uiManager.registerReactComponent('DocumentPreviewModal', DocumentPreviewModal);
}
