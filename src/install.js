define([
	'fontoxml-focus-highlight-view/nodeHighlightManager',
	'fontoxml-modular-ui/uiManager',

	'./ui/DocumentPreviewModal.jsx'
], function (
	nodeHighlightManager,
	uiManager,

	DocumentPreviewModal
) {
	'use strict';

	return function install () {
		// TODO: use some FDS "selection color" constant?
		nodeHighlightManager.styleAsSelectionHighlight('target-element', '#fdd835');

		uiManager.registerReactComponent('DocumentPreviewModal', DocumentPreviewModal);
	};
});
