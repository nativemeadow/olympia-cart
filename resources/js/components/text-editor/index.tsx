'use client';

import { useEffect, forwardRef, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

import Editor from '@/components/text-editor/Editor';

import './styles.css';

type EditorProps = {
    id: string;
    initialValue: string;
    handleEditorChange: (content: string) => void;
};

import React from 'react';
import { on } from 'events';

const EditorComponent = ({
    id,
    initialValue,
    handleEditorChange,
}: EditorProps) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    return (
        <Editor
            id={id}
            initialValue={initialValue}
            handleEditorChange={handleEditorChange}
        />
    );
};

export default EditorComponent;
