define([

], function () {
	'use strict';

	return /* @ngInject */ function DocumentPreviewModalController ($scope, $modalInstance, reference, referrerDocumentId) {
		$scope.uiDocumentPreviewModal = {
			reference: reference,
			referrerDocumentId: referrerDocumentId,
			targetSpec: {},

			close: $modalInstance.dismiss
		};
	};
});
