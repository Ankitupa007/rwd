import { Loader } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <Loader size={16} className="w-4 h-4 animate-spin mr-2" />
      <span className="text-sm">hold on...</span>
    </div>
  );
};
