"use client"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

function Pagination_({ searchParams, currentPage, total, path, isAdmin = true, runOnFunction = null }: any) {

    const router = useRouter()
    const hanldeNavigate = (page_: number) => {
        if (runOnFunction) {
            runOnFunction(page_)
            return
        }
        const queryString = new URLSearchParams({page: page_.toString() }).toString();
        router.push(`${isAdmin ? "/admin" : "/app"}/${path}	?${queryString}`);
    }

    const usePagination = (page: any, total: any) => {

        function onlyUnique(value: any, index: any, array: any) {
            return array.indexOf(value) === index;
        }

        // Function to insert nulls between gaps greater than 1
        function insertNulls(arr: any) {
            for (let i = arr.length - 1; i > 0; i--) {
                if (arr[i] - arr[i - 1] > 1) {
                    arr.splice(i, 0, null);
                }
            }
            return arr;
        }


        const pages = [1, 2, page - 1, page, page + 1, total - 1, total]
            .filter(value => value > 0 && value <= total)
            .filter(onlyUnique)
            .sort((a, b) => a - b);

        const result = insertNulls(pages);

        return result
    }

    const values = usePagination(currentPage, total)

    if (values.length === 1) return null

    return (
        <div className="flex items-end justify-end gap-2 w-max mr-auto  mt-5 ">
            <Pagination>
                <PaginationContent>
                    {currentPage > 1 && values.length > 3 && <PaginationItem className="hover:cursor-pointer" onClick={() => hanldeNavigate(currentPage - 1)}>
                        <PaginationPrevious />
                    </PaginationItem>}
                    {values.map((v: any, index: any) => (
                        v ? <PaginationItem className="hover:cursor-pointer">
                            <PaginationLink className={`${(currentPage === v) && "bg-muted"}`} isActive={currentPage === v} onClick={() => hanldeNavigate(v)}>{v}</PaginationLink>
                        </PaginationItem>
                            : <span className="flex h-9 w-9 items-center justify-center">
                                <MoreHorizontal className="h-4 w-4" />
                            </span>
                    ))}
                    {currentPage < total && values.length > 3 && <PaginationItem className="hover:cursor-pointer" onClick={() => hanldeNavigate(currentPage + 1)}>
                        <PaginationNext />
                    </PaginationItem>}
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default Pagination_

