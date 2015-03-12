define([
	'angular',

	'fontoxml-references',
	'fontoxml-references/uiModule',

	'fontoxml-ui-asset-browser/uiModule',
	'fontoxml-ui-buttons/uiModule',
	'fontoxml-ui-modal/uiModule',
	'fontoxml-ui-previews/uiModule',

	'./ui/createUiDocumentReferencePopoverDirective',
	'./ui/DocumentPreviewModalController',
], function (
	angular,

	references,
	referencesUiModule,

	uiAssetBrowserUiModule,
	uiButtonsUiModule,
	uiModalUiModule,
	uiPreviewsUiModule,

	createUiDocumentReferencePopoverDirective,
	DocumentPreviewModalController
	) {
	'use strict';

	var module = angular.module('fontoxml-references-document', [
			referencesUiModule,

			uiAssetBrowserUiModule,
			uiButtonsUiModule,
			uiModalUiModule,
			uiPreviewsUiModule
		]);

	module.directive('uiDocumentReferencePopover', createUiDocumentReferencePopoverDirective);
	module.controller('DocumentPreviewModalController', DocumentPreviewModalController);

	return module.name;
});

