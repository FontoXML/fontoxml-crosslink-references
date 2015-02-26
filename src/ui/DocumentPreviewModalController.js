define([

], function () {
	'use strict';

	return /* @ngInject */ function DocumentPreviewModalController ($scope, $modalInstance, reference) {
		console.log("reference", reference);

		$scope.uiDocumentPreviewModal = {
			reference: reference,
			targetSpec: {},

			close: $modalInstance.dismiss
		};
	};
});
