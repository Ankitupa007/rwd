import Link from 'next/link'
import Header from "@/components/common/header";

export default function NotFound() {
    return (
        <div>
            <Header />
            <div className={"container flex flex-col justify-center items-center h-[50vh] space-y-4"}>

            <h2 className={"text-2xl font-bold font-serif"}>Page not found</h2>
            <p>Could not find requested page</p>
            <Link href="/" className={"underline"}>Return Home</Link>
            </div>
        </div>
    )
}