import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Category } from '@/types/model-types';
import { CategoryHierarchy } from '@/types';
import CategorySelectionModal from './category-selection-modal';

interface CategoryManagementProps {
    allCategories: CategoryHierarchy[];
    associatedCategories: Category[];
    onCategoriesChange: (categories: Category[]) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
    allCategories,
    associatedCategories,
    onCategoriesChange,
}) => {
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    const handleCategorySave = (selectedCategories: Category[]) => {
        onCategoriesChange(selectedCategories);
        setCategoryModalOpen(false);
    };

    return (
        <div>
            <h3 className="text-lg font-medium">Associated Categories</h3>
            <div className="mt-4 flex flex-wrap gap-2">
                {associatedCategories.map((category) => (
                    <div
                        key={category.id}
                        className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                    >
                        {category.breadcrumb || category.title}
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setCategoryModalOpen(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add/Manage Categories
            </Button>

            <CategorySelectionModal
                isOpen={isCategoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                allCategories={allCategories}
                selectedCategories={associatedCategories}
                onSave={handleCategorySave}
            />
        </div>
    );
};

export default CategoryManagement;
