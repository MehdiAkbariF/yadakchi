import { ThreeDotsLoader } from '@/components/composites/Loading/ThreeDotsLoader';

export default function ProductLoading() {
  return (
    <div className="flex w-full min-h-[calc(100vh-160px)] items-center justify-center">
      <ThreeDotsLoader size="md" />
    </div>
  );
}