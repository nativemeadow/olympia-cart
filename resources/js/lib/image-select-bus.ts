import { Media } from '@/types/model-types';

type ImageSelectBus = {
    onSelect: ((image: Media) => void) | null;
};

export const imageSelectBus: ImageSelectBus = {
    onSelect: null,
};
