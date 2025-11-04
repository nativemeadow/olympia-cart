import { useForm } from '@inertiajs/react';
import { Button, Input } from '@heroui/react';
import { SearchIcon } from './SearchIcon';

import classes from './SearchProducts.module.css';

const SearchProducts = () => {
    const { data, setData, get, processing } = useForm({
        term: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.term.trim()) {
            // The route expects 'searchTerm', so we map 'term' to 'searchTerm'.
            get(route('search.index', { searchTerm: data.term }));
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            aria-label="search from products"
            className="flex items-center gap-2"
        >
            <Input
                classNames={{
                    base: 'max-w-full sm:max-w-[10rem] h-8',
                    mainWrapper: 'h-full',
                    input: classes['search-products'],
                    inputWrapper: 'h-full font-normal text-default-500',
                }}
                type="search"
                name="term"
                value={data.term}
                onChange={(e) => setData('term', e.target.value)}
                placeholder="Product search..."
                disabled={processing}
                size="sm"
            />
            <Button
                aria-label="search"
                aria-disabled={processing}
                className={classes['search-button']}
                type="submit"
                disabled={processing}
                isIconOnly
                size="sm"
                variant="flat"
            >
                <SearchIcon />
            </Button>
        </form>
    );
};

export default SearchProducts;
