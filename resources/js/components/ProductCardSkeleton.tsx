import { Skeleton } from '@/components/ui/skeleton';
import classes from './Card.module.css';

const ProductCardSkeleton = () => {
    return (
        <div className={classes['card-container']}>
            <div className={classes.card}>
                <Skeleton className="h-[200px] w-[200px]" />
            </div>
            <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
