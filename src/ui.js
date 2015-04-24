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

	uiManager.addDirective('uiDocumentReferencePopover', createUiDocumentReferencePopoverDirective);
	uiManager.addController('DocumentPreviewModalController', DocumentPreviewModalController);
});

