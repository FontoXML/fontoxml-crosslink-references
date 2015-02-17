define([
	'angular',

	'fontoxml-references',
	'fontoxml-references/uiModule',

	'./ui/DocumentReferencePopoverController',
	'./ui/DocumentPreviewModalController',
], function (
	angular,

	references,
	referencesUiModule,

	DocumentReferencePopoverController,
	DocumentPreviewModalController
	) {
	'use strict';

	var module = angular.module('fontoxml-references-document', [
			referencesUiModule
		]);

	module.controller('DocumentReferencePopoverController', DocumentReferencePopoverController);
	module.controller('DocumentPreviewModalController', DocumentPreviewModalController);

	// Register the template for document references
	references.referencePopoverContentService.setContentTemplateForReferenceType(
		'document',
		'fontoxml-references-document/ui/document-reference-popover-content-template.html');

	return module.name;
});
