define([

], function () {
	'use strict';

	return /* @ngInject */ function DocumentPreviewModalController ($scope, $modalInstance, reference) {
		$scope.uiDocumentPreviewModal = {
			reference: reference,
			targetSpec: {},

			close: $modalInstance.dismiss
		};
	};
});
