---
category: add-on/fontoxml-crosslink-references
---

# Cross references library

This add-on provides a popover and a modal for use with cross-document references.

## Getting started

This add-on can be added to an editor by selecting it in the list of add-ons available on the SDK portal. This can then be installed as usual.

---

## Usage of the open-document-preview-modal

The {@link operation/open-document-preview-modal} operation is used to open the document preview modal. This modal shows a document with a selected element. This can be used to show an element being referenced by a crosslink.

For more information, see the {@link operation/open-document-preview-modal} operation.

## Usage of the CrossReferencePopover

The {@link CrossReferencePopover} operation is used to show more information about a crosslink.

This popover can be used by configuring it for the desired element. See the {@link Creating a popover} guide for more information.

# Contributing

This package can serve as a base for custom versions of the CMS browser. It can be forked by
checking it out directly in the `packages` folder of an editor. When making a fork, consider keeping
it up-to-date with new Fonto Editor versions when they release.

We highly appreciate pull requests if you find a bug. For more general improvements or new features,
please file a [support.fontoxml.com](support request). That way, we can think along and make sure an
improvement is made in a way that benefits all users of this package.
