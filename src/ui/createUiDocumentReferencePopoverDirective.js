define([
	'fontoxml-documents/documentsManager',
	'fontoxml-markup-documentation/getMarkupLabel',
	'fontoxml-markup-documentation/getTitleContent',
	'fontoxml-dom-utils/domQuery',
	'fontoxml-ui-modal/modalManager',
	'fontoxml-references/referencesManager',
	'fontoxml-utils/truncator'
], function (
	documentsManager,
	getMarkupLabel,
	getTitleContent,
	domQuery,
	modalManager,
	referencesManager,
	truncator
	) {
	'use strict';

	var TEXT_CONTENT_TRUNCATE_LENGTH = 140;

	// @TODO: Use a better getTextContent, such as the (terribly complicated) xPath used in
	//        dita-standard-sx-modules-xsd-map-mod/configureSxModule.js
	var getTextContent = domQuery.getTextContent;

	/* @ngInject */ function UiDocumentReferencePopoverController ($scope) {
		this.$scope = $scope;
		this.wasResolved = null; // null = resolving, true = success, false = error
	}

	function transformReferenceToTargetSpec (uiDocumentReferencePopover, reference, referrerDocumentId) {
		return referencesManager.transformReferenceToTargetSpec(reference, referrerDocumentId)
			.then(function (targetSpec) {
				var targetNode = targetSpec.nodeId ?
						documentsManager.getNodeById(targetSpec.nodeId, targetSpec.documentId) :
						documentsManager.getDocumentNode(targetSpec.documentId).documentElement;

				return new Promise(function (resolve) {
					uiDocumentReferencePopover.$scope.$applyAsync(function () {
						var textContent = getTextContent(targetNode);

						uiDocumentReferencePopover.wasResolved = true;
						uiDocumentReferencePopover.markupLabel = getMarkupLabel(targetNode) || targetNode.nodeName;
						uiDocumentReferencePopover.titleContent = getTitleContent(targetNode);
						uiDocumentReferencePopover.textContent = truncator.truncateRight(
							textContent,
							TEXT_CONTENT_TRUNCATE_LENGTH,
							false // Do not respect word boundaries to avoid truncation bug, see also FXC-1546
						);
						resolve();
					})
				});
			})
			.catch(function () {
				return new Promise(function (resolve) {
					uiDocumentReferencePopover.$scope.$applyAsync(function () {
						uiDocumentReferencePopover.wasResolved = false;
						resolve();
					});
				});
			});
	}

	UiDocumentReferencePopoverController.prototype.isQuotedFromContent = function () {
		return !!(this.titleContent || this.textContent);
	};

	UiDocumentReferencePopoverController.prototype.getTextRepresentation = function () {
		return (this.reference && this.reference.metadata && this.reference.metadata.title) || this.titleContent || this.textContent;
	};

	UiDocumentReferencePopoverController.prototype.previewReference = function () {
		this.$scope.uiReferencePopover.hidePopover();

		var reference = this.$scope.uiReferencePopover.reference,
			referrerDocumentId = this.$scope.uiReferencePopover.referrerDocumentId;

		modalManager.openModal({
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
				transformReferenceToTargetSpec(
					scope.uiDocumentReferencePopover,
					uiReferencePopoverController.reference,
					uiReferencePopoverController.referrerDocumentId)
					.then(function () {
						uiReferencePopoverController.repositionPopover();
					});
			},
			controller: UiDocumentReferencePopoverController,
			controllerAs: 'uiDocumentReferencePopover',
			bindToController: true
		};
	};
});
