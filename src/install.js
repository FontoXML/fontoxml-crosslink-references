define([
	'fontoxml-documents/documentLifecycleManager',
	'fontoxml-documents/documentsManager',
	'fontoxml-dom-identification/getNodeId',
	'fontoxml-modular-ui/uiManager',
	'fontoxml-operations/addTransform',
	'fontoxml-references/referencesManager',

	'./ui/createUiDocumentReferencePopoverDirective',

	'./ui/NodePreviewModal.jsx',
	'./bridge/NodePreviewModalBridgeController'
], function (
	documentLifecycleManager,
	documentsManager,
	getNodeId,
	uiManager,
	addTransform,
	referencesManager,

	createUiDocumentReferencePopoverDirective,

	NodePreviewModal,
	NodePreviewModalBridgeController
) {
	'use strict';

	return function install () {
		uiManager.addDirective('uiDocumentReferencePopover', createUiDocumentReferencePopoverDirective);

		uiManager.addController('NodePreviewModalBridgeController', NodePreviewModalBridgeController);
		uiManager.registerReactComponent('NodePreviewModal', NodePreviewModal);

		/**
		 * @param stepData.reference
		 * @param stepData.referrerDocumentId
		 */
		addTransform(
			'setTargetNodeIdForDocumentReference',
			function (stepData) {
				return referencesManager.transformReferenceToTargetSpec(
					stepData.reference,
					stepData.referrerDocumentId)
					.then(function (targetSpec) {
						// If the targetSpec has no remoteDocumentId, it must already have a nodeId and documentId
						if (!targetSpec.remoteDocumentId) {
							return targetSpec;
						}

						// If the targetSpec has a remoteDocumentId, resolve it to a nodeId and documentId
						return documentLifecycleManager
							.loadDocument(targetSpec.remoteDocumentId)
							.then(function (documentId) {
								return {
									documentId: documentId,
									nodeId: getNodeId(documentsManager.getDocumentNode(documentId).documentElement)
								};
							});
					})
					.then(function (targetSpec) {
						stepData.targetNodeId = targetSpec.nodeId;

						return stepData;
					});
			});

		/**
		 * @param stepData.contextNodeId
		 */
		addTransform(
			'setDocumentNodeIdForContextNodeId',
			function (stepData) {
				var documentId = documentsManager.getDocumentIdByNodeId(stepData.contextNodeId);
				var documentNode = documentsManager.getDocumentNode(documentId);

				stepData.documentNodeId = getNodeId(documentNode.documentElement);

				return stepData;
			});
	};
});
