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

	return module.name;
});
