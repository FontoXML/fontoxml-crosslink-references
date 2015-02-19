define([
	'angular',

	'fontoxml-references',
	'fontoxml-references/uiModule',

	'./ui/createUiDocumentReferencePopoverDirective',
	'./ui/DocumentPreviewModalController',
], function (
	angular,

	references,
	referencesUiModule,

	createUiDocumentReferencePopoverDirective,
	DocumentPreviewModalController
	) {
	'use strict';

	var module = angular.module('fontoxml-references-document', [
			referencesUiModule
		]);

	module.directive('uiDocumentReferencePopover', createUiDocumentReferencePopoverDirective);
	module.controller('DocumentPreviewModalController', DocumentPreviewModalController);

	// Register the template for document references
	references.referencePopoverContentService.setContentTemplateUrlForReferenceType(
		'document',
		'fontoxml-references-document/ui/document-reference-popover-content-template.html');

	return module.name;
});
