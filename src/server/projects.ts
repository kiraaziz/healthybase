import { auth } from "./auth"
import { db } from "./db"

const getUserId = async () => {
    const user = await auth()
    return user?.user?.id
}

const useGetProject = async () => {
    const userId = await getUserId()

    if (!userId) {
        return []
    }

    const projects = await db.project.findMany({
        where: {
            userId: userId
        }
    })

    if (projects.length === 0) {
        const newProject = await db.project.create({
            data: {
                userId: userId,
                name: "Default",
                type: "Personal"
            }
        })
        projects.push(newProject)
    }

    return projects
}

export { useGetProject }