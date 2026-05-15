import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, X } from 'lucide-react';
import { useState } from 'react';

type MediaSearchInputProps = {
    initialValue: string;
    onSearch: (searchTerm: string) => void;
    onClear: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
};

const MediaSearchInput = ({
    initialValue,
    onSearch,
    onClear,
    inputRef,
}: MediaSearchInputProps) => {
    const [inputValue, setInputValue] = useState(initialValue || '');

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    const handleClearClick = () => {
        setInputValue('');
        onClear();
    };

    return (
        <form onSubmit={handleFormSubmit} className="relative w-64">
            <Input
                ref={inputRef}
                value={inputValue}
                type="search"
                placeholder="Search media..."
                className="hide_input_clear_button w-full rounded-lg bg-background pr-20"
                onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="absolute top-0 right-0 flex h-full items-center">
                {inputValue && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleClearClick}
                        className="h-full rounded-none"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    className="h-full rounded-l-none"
                    onClick={() => onSearch(inputValue)}
                >
                    <Search className="h-5 w-5" />
                </Button>
            </div>
        </form>
    );
};

export default MediaSearchInput;
