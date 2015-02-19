define([
	'editor'
], function (
	editor
	) {
	'use strict';

	// TODO: this kind of logic should be encapsulated in a seperate package
	// TODO: extend to wrap the entire dita spec
	// NOTE: could also be needed for editor flow?
	// NOTE: we could really use a proper model for this
	function resolveRemoteDocumentIdFromTarget (reference, nodeId) {
		return new Promise(function (resolve, reject) {
			// If '#' is in the target, the target is the remoteDocumentId
			// If '#' is at the start of the target, it is a relative link to the current document
			// Else, the part of the target up till '#' is the remoteDocumentId
			var target = reference.target,
				hashSymbolIndex = target.indexOf('#');
			if (hashSymbolIndex === -1) {
				resolve(target);
			} else if (hashSymbolIndex === 0) {
				// TODO: retrieve the remoteDocumentId for the document in which nodeId lives
				reject('Not yet supported');
			} else {
				resolve(target.substring(0, hashSymbolIndex));
			}
		});
	}

	return function createUiDocumentReferencePopoverDirective () {
		return {
			restrict: 'E',
			templateUrl: require.toUrl('fontoxml-references-document/ui/ui-document-reference-popover.html'),
			scope: {},
			require: '^uiReferencePopover',
			link: function (scope, element, attrs, uiReferencePopoverController) {
				// TODO: use a generic document edit operation here which has a step which determines the specific implementation
				// according to the element being edited.
				uiReferencePopoverController.setEditOperationName('xref-dita-edit');

				scope.uiDocumentReferencePopover = {
					uiReferencePopover: uiReferencePopoverController,

					previewReference: function () {
						resolveRemoteDocumentIdFromTarget(
							uiReferencePopoverController.reference,
							uiReferencePopoverController.nodeId)
							.then(function(documentRemoteId) {
								uiReferencePopoverController.hidePopover();

								// TODO: verify if this is the best approach to opening modals
								return editor.openModal({
									controller: 'DocumentPreviewModalController',
									templateUrl: require.toUrl('fontoxml-references-document/ui/document-preview-modal-template.html'),
									resolve: {
										documentRemoteId: function () {
											return documentRemoteId;
										}
									}
								});
							})
							.catch(function (error) {
								// TODO: implement error handling code
								console.error(error);
							});
					}
				};
			}
		};
	};
});
