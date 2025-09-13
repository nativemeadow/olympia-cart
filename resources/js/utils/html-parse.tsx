import React from 'react';
import parse, { DOMNode, Element } from 'html-react-parser';

export const parser = (input: string) =>
	parse(input, {
		replace: (domNode: DOMNode) => {
			if (domNode instanceof Element) {
				return <></>;
			}
		},
	});
