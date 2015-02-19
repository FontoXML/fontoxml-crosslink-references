define([
	'editor'
], function (
	editor
	) {
	'use strict';

	return function createUiDocumentReferencePopoverDirective () {
		return {
			restrict: 'E',
			templateUrl: require.toUrl('fontoxml-references-document/ui/ui-document-reference-popover.html'),
			scope: {},
			require: '^uiReferencePopover',
			link: function (scope, element, attrs, uiReferencePopoverController) {
				// TODO: use a generic document edit operation here which has a step which determines the specific
				// implementation according to the element being edited.
				uiReferencePopoverController.setEditOperationName('xref-dita-edit');

				scope.uiDocumentReferencePopover = {
					uiReferencePopover: uiReferencePopoverController,

					previewReference: function () {
						editor.getRemoteDocumentIdFromReference(uiReferencePopoverController.reference)
							.then(function(documentRemoteId) {
								uiReferencePopoverController.hidePopover();

								return editor.openModal({
									controller: 'DocumentPreviewModalController',
									templateUrl: require.toUrl('fontoxml-references-document/ui/document-preview-modal-template.html'),
									resolve: {
										documentRemoteId: function () {
											return documentRemoteId;
										}
									}
								});
							});
					}
				};
			}
		};
	};
});
