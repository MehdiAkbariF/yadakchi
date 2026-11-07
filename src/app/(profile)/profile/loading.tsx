import { ThreeDotsLoader } from '@/components/composites/Loading/ThreeDotsLoader';

export default function ProductLoading() {
  return (
    <div className="flex w-full min-h-[calc(100vh-10rem)] items-center justify-center">
      <ThreeDotsLoader size="md" />
    </div>
  );
}