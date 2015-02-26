define([
	'editor'
], function (
	editor
) {
	'use strict';

	/* @ngInject */ function UiDocumentReferencePopoverController ($scope) {
		this.$scope = $scope;
	}

	UiDocumentReferencePopoverController.prototype.previewReference = function () {
		this.$scope.uiReferencePopover.hidePopover();

		var reference = this.$scope.uiReferencePopover.reference,
			referrerDocumentId = this.$scope.uiReferencePopover.referrerDocumentId;

		editor.openModal({
			controller: 'DocumentPreviewModalController',
			templateUrl: require.toUrl('fontoxml-references-document/ui/document-preview-modal-template.html'),
			resolve: {
				reference: function () {
					return reference;
				},
				referrerDocumentId: function () {
					return referrerDocumentId;
				}
			}
		});
	};

	return function createUiDocumentReferencePopoverDirective () {
		return {
			restrict: 'E',
			templateUrl: require.toUrl('fontoxml-references-document/ui/ui-document-reference-popover.html'),
			scope: {
				linkDescription: '@',
				previewTooltip: '@'
			},
			require: '^uiReferencePopover',
			link: function (scope, element, attrs, uiReferencePopoverController) {
				scope.uiReferencePopover = uiReferencePopoverController;
			},
			controller: UiDocumentReferencePopoverController,
			controllerAs: 'uiDocumentReferencePopover',
			bindToController: true
		};
	};
});
