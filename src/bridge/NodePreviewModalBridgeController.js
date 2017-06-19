define([
	'fontoxml-selection/selectionManager',

	'./reactToAngularModalBridge'
], function (
	selectionManager,

	reactToAngularModalBridge
) {
	'use strict';

	/* @ngInject */ function NodePreviewModalBridgeController ($scope, operationData) {
		selectionManager.preventEditorFocus();

		reactToAngularModalBridge.operationData = operationData;

		reactToAngularModalBridge.closeModal = function closeModal () {
			selectionManager.allowEditorFocus();

			$scope.$dismiss();
		};
	}

	return NodePreviewModalBridgeController;
});
