import { Input } from "@/components/ui/input";

export default function Search() {
  return (
    <div className="flex h-full flex-col items-center justify-center overflow-hidden">
      <h1 className="text-primary mb-6 text-6xl font-bold">Search</h1>
      <Input
        className="bg-sidebar max-w-120"
        placeholder="Write your query here..."
      />
    </div>
  );
}
