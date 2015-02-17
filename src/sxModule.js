define(
	[
		'fontoxml-modular-schema-experience',

		'text!./sx/operations.json'
	],
	function(
		modularSchemaExperience,

		operationsJSON
		) {
		'use strict';

		var module = modularSchemaExperience.configurator.module('fontoxml-references-document');

		// Wire up all the operations.
		module.register('operations')
			.addOperations(JSON.parse(operationsJSON));

		return module.getModuleName();
	}
);

