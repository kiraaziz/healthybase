import { Suspense } from 'react'
import { Table, Database, Layers3, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useGetFullProject } from '@/server/serverData/projects'
import { useGetBuckets } from '@/server/serverData/buckets'
import Loader from '@/components/globals/Loader'
import ProjectSettings from '@/components/project/ProjectSettings'
import PrimarySwitcher from '@/components/globals/PrimarySwitcher'
import BuckupNow from '@/components/Cors/BuckupNow'
import Pagination from '@/components/globals/Pagination'
import BucketActions from '@/components/Cors/BucketActions'
import Server from '@/components/Images/Server'
import MountNow from '@/components/Cors/MountNow'
import OnboardingPopup from '@/components/globals/onBorading'
import { LocalTimeAgo } from '@/components/globals/LocalTimeRender'

export async function generateMetadata({ params }: any) {
  const project = await useGetFullProject((await params).id, true);
  return {
    title: project?.name
      ? `${project.name} - Healthy Base Backup`
      : "Healthy Base - Automated PostgreSQL Backup Creator",
  };
}

export default async function page({ params, searchParams }: any) {
  const pageNum = Number((await searchParams)?.page) || 1;
  return (
    <Suspense key={JSON.stringify({ ...await params, pageNum })} fallback={<div className='w-full mx-auto flex items-center justify-center min-h-[50svh]'>
      <Loader />
    </div>}>
      <ProjectLoader params={params} pageNum={pageNum} searchParams={await searchParams} />
    </Suspense>
  )
}

async function ProjectLoader({ params, pageNum, searchParams }: any) {
  const project = await useGetFullProject((await params).id) as any;

  const take = 10;
  const { buckets, total } = await useGetBuckets({ projectId: (await params).id, page: pageNum });

  const totalBackups = total || 1;
  const totalPages = Math.ceil(totalBackups / take);

  const {
    isHealthy,
    responseTime,
    connectionInfo = {},
    serverInfo = {},
  } = project.dbHealthCheck || {};

  const {
    activeConnections,
    maxConnections,
  } = serverInfo || {};

  return (
    <div>
      <PrimarySwitcher color={project.currentSetting?.color || "#72e3ad"} />
      {!project.onBoarding && <OnboardingPopup />}
      <div className="w-full bg-muted py-6">
        <div className="w-full max-w-4xl px-4 flex mx-auto mt-4">
          <p className="text-base text-foreground/60 mb-4 flex">
            <img src="/logos/postgre.png" className="h-8 mr-4 " />
            <span className="text-foreground mr-1 text-lg font-normal capitalize">{project.name}</span>
            <span className='hidden lg:block'>
              - Backup your database in a few clicks.
            </span>
          </p>
        </div>
        <div className="max-w-4xl px-4 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border bg-background rounded-xl px-5 py-3 flex gap-3  group hover:cursor-pointer">
            <div className={`h-2 w-2 translate-y-1 rounded-full animate-ping ${isHealthy ? "bg-primary" : "bg-destructive"}`} />
            <div>
              <p className="text-muted-foreground/70 text-sm blur-[2px] group-hover:blur-none ease-in-out duration-300">
                {connectionInfo && connectionInfo.host
                  ? (() => {
                    const connStr = `${connectionInfo.host}:${connectionInfo.port}/${connectionInfo.database}`;
                    return connStr.length > 20
                      ? `${connStr.slice(0, 20)}...`
                      : connStr;
                  })()
                  : "N/A"}
              </p>
              <p className={`text-white w-max px-3 rounded-full ${isHealthy ? "bg-primary" : "bg-destructive"}`}>
                {isHealthy === undefined ? "Unknown" : isHealthy ? "Healthy" : "Unhealthy"}
              </p>
            </div>
          </div>
          <div className="border bg-background rounded-xl px-5 py-3 flex gap-3">
            <Database className="text-muted-foreground translate-y-1" size={20} />
            <div>
              <p className="text-muted-foreground/60 text-sm">Active Connections</p>
              <p className="text-xl">
                {typeof activeConnections === "number" ? activeConnections : "N"}/{typeof maxConnections === "number" ? maxConnections : "A"}
              </p>
            </div>
          </div>
          <div className="border bg-background rounded-xl px-5 py-3 flex gap-3">
            <Clock className="text-muted-foreground translate-y-1" size={20} />
            <div>
              <p className="text-muted-foreground/60 text-sm">Response Time</p>
              <p className="text-xl">
                {typeof responseTime === "number" ? `${responseTime} ms` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl px-4 py-6 w-full rounded-lg mx-auto">
        {buckets.length !== 0 && <div className="mb-4 w-full flex items-center justify-end gap-2">
          <ProjectSettings project={project} />
          <BuckupNow projectId={project.id} />
        </div>}
        <div className="flex flex-col gap-4">
          <div className={`${buckets.length !== 0 && "opacity-0 h-0"}`}>
            <div className='mx-auto w-64 p-6 flex flex-col gap-4 items-center justify-center text-center' >
              <Server />
              <h1 className='text-lg'>No Backups created yet</h1>
            </div>
            <div className="mb-4 w-full flex items-center justify-center gap-2">
              <ProjectSettings project={project} isOnBorading={true} />
              <BuckupNow projectId={project.id} />
            </div>
          </div>
          {buckets.map((backup) => (
            <div
              key={backup.id}
              className={`w-full bg-white border rounded-xl  px-6 py-4 gap-6 relative group ${backup.status === "failed" && "!border-l-destructive"} hover:cursor-pointer`}
              style={{ borderLeft: `8px solid ${backup.color || "#72e3ad"}` }}
            >
              <div className='flex items-center'>
                <div className="flex flex-col flex-1 min-w-0">

                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-muted-foreground blur-[4px] group-hover:blur-none ease-in-out duration-200">
                      {backup.setting || "Unknown"}
                    </span>
                    {backup.status === "success" ? (
                      <CheckCircle className="text-green-500" size={18} />
                    ) : backup.status === "failed" ? (
                      <XCircle className="text-red-500" size={18} />
                    ) : backup.status === "pending" ? (
                      <Clock className="text-indigo-500" size={18} />
                    ) : (
                      <Clock className="text-muted-foreground" size={18} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      <Clock size={14} className="inline mr-1 -mt-0.5" />
                      <LocalTimeAgo dateTime={(backup as any).createdAt} />
                    </span>
                    <span>
                      <Layers3 size={14} className="inline mr-1 -mt-0.5" />
                      {typeof backup.fileSize === "number"
                        ? `${(backup.fileSize / (1024 * 1024)).toFixed(2)} MB`
                        : backup.fileSize || "N/A"}
                    </span>
                    <span>
                      <Table size={14} className="inline mr-1 -mt-0.5" />
                      {backup.estimatedTime !== null && backup.estimatedTime !== undefined
                        ? `${backup.estimatedTime} ms`
                        : "N/A"}
                    </span>
                  </div>

                  {backup.logs && backup.logs.trim() !== "" && (
                    <div className="mt-4 text-sm text-destructive bg-destructive/5 border border-destructive/30 rounded-xl p-4 break-all">
                      <strong>Logs:</strong> {backup.logs}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <BucketActions showDownload={backup.status === "success"} bucketId={backup.id} key={backup.id} />
                </div>
              </div>
              {backup.status === "success" && <div className='pt-4'>
                <MountNow
                  backupId={backup.id}
                  color={backup.color || "#72e3ad"}
                  oldBase={backup.setting}
                  currentBase={`${connectionInfo.host}:${connectionInfo.port}/${connectionInfo.database}`}
                />
              </div>}
              {backup.MountLog.length > 0 && (
                <div className='mt-3 border rounded-md overflow-hidden'>
                  {backup.MountLog.map((log, index) => (
                    <div
                      key={log.id}
                      className={`text-xs p-3 ${index !== (backup.MountLog.length - 1) && "border-b"}`}
                    >
                      <div className='flex items-center justify-between gap-2 mb-1.5'>
                        <div className='flex flex-wrap gap-2'>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : log.status === 'fail'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            {log.status === 'success' && '✓ Success'}
                            {log.status === 'fail' && '✗ Failed'}
                            {log.status === 'in_progress' && '⋯ In Progress'}
                          </span>
                          <p className='text-foreground/70 leading-relaxed'>
                            {log.logText}
                          </p>
                        </div>
                        <div className='flex items-center gap-2 text-foreground/50'>
                          <LocalTimeAgo dateTime={log.createdAt} />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <Pagination
          searchParams={searchParams}
          currentPage={pageNum}
          total={totalPages}
          path={(await params).id}
          isAdmin={false}
        />
      </div>
    </div>
  );
}
