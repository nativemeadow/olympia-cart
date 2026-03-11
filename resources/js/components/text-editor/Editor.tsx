/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
    $getRoot,
    $getSelection,
    $createTextNode,
    $createParagraphNode,
    $isTextNode,
    DOMConversionMap,
    DOMExportOutput,
    DOMExportOutputMap,
    isHTMLElement,
    Klass,
    LexicalEditor,
    LexicalNode,
    ParagraphNode,
    TextNode,
} from 'lexical';

import { HeadingNode } from '@lexical/rich-text';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import CustomOnChangePlugin from './plugins/CustomOnChangePlugin';

import ExampleTheme from './Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { parseAllowedColor, parseAllowedFontSize } from './styleConfig';

const placeholder = '';

const removeStylesExportDOM = (
    editor: LexicalEditor,
    target: LexicalNode,
): DOMExportOutput => {
    const output = target.exportDOM(editor);
    if (output && isHTMLElement(output.element)) {
        // Remove all inline styles and classes if the element is an HTMLElement
        // Children are checked as well since TextNode can be nested
        // in i, b, and strong tags.
        for (const el of [
            output.element,
            ...output.element.querySelectorAll('[style],[class],[dir="ltr"]'),
        ]) {
            el.removeAttribute('class');
            el.removeAttribute('style');
            if (el.getAttribute('dir') === 'ltr') {
                el.removeAttribute('dir');
            }
        }
    }
    return output;
};

const exportMap: DOMExportOutputMap = new Map<
    Klass<LexicalNode>,
    (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
    [ParagraphNode, removeStylesExportDOM],
    [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
    // Parse styles from pasted input, but only if they match exactly the
    // sort of styles that would be produced by exportDOM
    let extraStyles = '';
    const fontSize = parseAllowedFontSize(element.style.fontSize);
    const backgroundColor = parseAllowedColor(element.style.backgroundColor);
    const color = parseAllowedColor(element.style.color);
    if (fontSize !== '' && fontSize !== '15px') {
        extraStyles += `font-size: ${fontSize};`;
    }
    if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
        extraStyles += `background-color: ${backgroundColor};`;
    }
    if (color !== '' && color !== 'rgb(0, 0, 0)') {
        extraStyles += `color: ${color};`;
    }
    return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
    const importMap: DOMConversionMap = {};

    // Wrap all TextNode importers with a function that also imports
    // the custom styles implemented by the playground
    for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
        importMap[tag] = (importNode) => {
            const importer = fn(importNode);
            if (!importer) {
                return null;
            }
            return {
                ...importer,
                conversion: (element) => {
                    const output = importer.conversion(element);
                    if (
                        output === null ||
                        output.forChild === undefined ||
                        output.after !== undefined ||
                        output.node !== null
                    ) {
                        return output;
                    }
                    const extraStyles = getExtraStyles(element);
                    if (extraStyles) {
                        const { forChild } = output;
                        return {
                            ...output,
                            forChild: (child, parent) => {
                                const textNode = forChild(child, parent);
                                if ($isTextNode(textNode)) {
                                    textNode.setStyle(
                                        textNode.getStyle() + extraStyles,
                                    );
                                }
                                return textNode;
                            },
                        };
                    }
                    return output;
                },
            };
        };
    }

    return importMap;
};

const editorConfig = (initialValue: string) => ({
    namespace: 'RichText',
    nodes: [ParagraphNode, TextNode],
    onError(error: Error) {
        throw error;
    },
    theme: ExampleTheme,
    initialEditorState: (editor: LexicalEditor) => {
        editor.update(() => {
            const root = $getRoot();
            root.clear();
            const parser = new DOMParser();
            const doc = parser.parseFromString(initialValue, 'text/html');
            const nodes = doc.body.childNodes;
            nodes.forEach((node) => {
                const paragraphNode = $createParagraphNode();
                const textNode = $createTextNode(node.textContent || '');
                paragraphNode.append(textNode);
                root.append(paragraphNode);
            });
        });
    },
});

type EditorProps = {
    id: string;
    initialValue: string;
    handleEditorChange: (content: string) => void;
};

export default function Editor({
    id,
    initialValue,
    handleEditorChange,
}: EditorProps) {
    return (
        <LexicalComposer initialConfig={editorConfig(initialValue)}>
            <div
                className="editor-container"
                onClick={(e) => {
                    console.log('bubbled up to div container');
                    e.stopPropagation();
                }}
            >
                <ToolbarPlugin />
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="editor-input"
                                aria-placeholder={placeholder}
                                placeholder={
                                    <div className="editor-placeholder">
                                        {placeholder}
                                    </div>
                                }
                                width="800"
                                height="400"
                            />
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <CustomOnChangePlugin
                        value={initialValue}
                        onChange={handleEditorChange}
                    />
                    <HistoryPlugin />
                    {/* <AutoFocusPlugin />
                    <TreeViewPlugin /> */}
                </div>
            </div>
        </LexicalComposer>
    );
}
