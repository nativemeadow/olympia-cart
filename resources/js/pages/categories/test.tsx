import React from 'react';
import { CategoryDataType } from '@/types';

// Props for the Test component
type TestProps = {
    categoryData: {
        data: CategoryDataType;
    };
    category_path: string;
};

const Test = ({ categoryData, category_path }: TestProps) => {
    const category: CategoryDataType = categoryData.data;

    return (
        <div>
            <h1 className="mb-2 text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                {category.title}
            </h1>
            <h3>{category_path}</h3>
            <pre>{JSON.stringify(category, null, 2)}</pre>
        </div>
    );
};

export default Test;
