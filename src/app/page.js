import Image from "next/image";
import SearchInput from "./search-input";
import Header from "@/components/common/header";

export default function Home() {
  return (
    <div className="">
      <Header />
      <SearchInput />
    </div>
  );
}
