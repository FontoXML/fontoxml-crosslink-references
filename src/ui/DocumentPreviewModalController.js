define([

], function () {
	'use strict';

	return /* @ngInject */ function DocumentPreviewModalController ($scope, $modalInstance, reference, referrerDocumentId) {
		console.log("reference", reference);

		$scope.uiDocumentPreviewModal = {
			reference: reference,
			referrerDocumentId: referrerDocumentId,
			targetSpec: {},

			close: $modalInstance.dismiss
		};
	};
});
