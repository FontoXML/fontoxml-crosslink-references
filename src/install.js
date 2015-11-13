define([
	'fontoxml-modular-ui/uiManager',
	'fontoxml-operations/operationsManager',

	'./ui/createUiDocumentReferencePopoverDirective',
	'./ui/DocumentPreviewModalController',

	'json!./sx/operations.json'
], function (
	uiManager,
	operationsManager,

	createUiDocumentReferencePopoverDirective,
	DocumentPreviewModalController,

	operationsJson
	) {
	'use strict';

	return function install () {
		uiManager.addDirective('uiDocumentReferencePopover', createUiDocumentReferencePopoverDirective);
		uiManager.addController('DocumentPreviewModalController', DocumentPreviewModalController);

		operationsManager.addOperations(operationsJson);
	};
});
