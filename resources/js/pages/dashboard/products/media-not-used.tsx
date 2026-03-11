import { Media } from '@/types/model-types';
import { Paginated } from '@/types';
import { Button } from '@/components/ui/button';

interface MediaListProps {
    media: Paginated<Media>;
    onSelect: (image: Media) => void;
}

export default function MediaList({ media, onSelect }: MediaListProps) {
    const handleSelect = (image: Media) => {
        onSelect(image);
    };

    return (
        <div>
            {/* You can add pagination controls here later if needed */}
            <div className="grid grid-cols-4 gap-4">
                {media.data.map((mediaItem) => (
                    <div key={mediaItem.id}>
                        <img
                            src={`/${mediaItem.file_path}${mediaItem.file_name}`}
                            alt={mediaItem.alt_text || mediaItem.title}
                            className="h-auto w-full object-cover"
                        />
                        <Button
                            type="button"
                            onClick={() => handleSelect(mediaItem)}
                            className="mt-2 w-full"
                        >
                            Select
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
