define([
	'fontoxml-modular-ui/uiManager',

	'./ui/createUiDocumentReferencePopoverDirective',
	'./ui/DocumentPreviewModalController'
], function (
	uiManager,

	createUiDocumentReferencePopoverDirective,
	DocumentPreviewModalController
) {
	'use strict';

	return function install () {
		uiManager.addDirective('uiDocumentReferencePopover', createUiDocumentReferencePopoverDirective);
		uiManager.addController('DocumentPreviewModalController', DocumentPreviewModalController);
	};
});
