import { db } from "../db"

export const useGetBuckets = async ({ projectId, page = 1 }: { projectId: string, page?: number }) => {
    if (!projectId) {
        return { buckets: [], total: 0 }
    }

    const take = 10
    const skip = (page - 1) * take

    const [buckets, total] = await Promise.all([
        db.backup.findMany({
            where: {
                projectId: projectId
            },
            orderBy: {
                createdAt: "desc"
            },
            skip,
            take,
            include: {
                MountLog: {
                    take: 5,
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        }),
        db.backup.count({
            where: {
                projectId: projectId
            }
        })
    ])

    return { buckets, total }
}