define([
	'editor'
], function (
	editor
	) {
	'use strict';

	return /* @ngInject */ function DocumentPreviewModalController ($scope, $modalInstance, documentRemoteId, bufferDigest) {
		// Load the document
		editor.loadDocumentForPreview(documentRemoteId)
			.then(function (documentId) {
				bufferDigest(function () {
					$scope.documentReference = {
						documentId: documentId
					};
				});
			});

		$scope.close = function () {
			$modalInstance.dismiss();
		};
	};
});
