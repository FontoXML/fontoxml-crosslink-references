define([
	'fontoxml-modular-ui/uiManager',

	'./ui/DocumentPreviewModal.jsx'
], function (
	uiManager,

	DocumentPreviewModal
) {
	'use strict';

	return function install () {
		uiManager.registerReactComponent('DocumentPreviewModal', DocumentPreviewModal);
	};
});
