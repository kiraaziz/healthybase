import React from 'react'

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <div className={className}>
            <div className='h-7 w-7 relative'>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="32"
                    height="32"
                    viewBox="0 0 512 512"
                    xmlSpace="preserve"
                    className='absolute'
                >
                    <g>
                        <path
                            className='fill-primary/50'
                            d="M113.707 512 55.575 391.792c-43.694-90.351-18.098-196.268 55.842-257.579 46.027-38.166 89.94-78.812 130.239-122.984L251.9 0l23.821 31.473c29.393 38.834 51.822 80.128 65.073 121.97z"
                            opacity="1"
                        ></path>
                        <path
                            className='fill-primary/60'
                            d="m468.766 149.938-7.743-38.704c-38.269 90.207-136.426 138.139-192.689 200.383C169.942 420.469 113.707 512 113.707 512h58.256c258.928 0 334.274-174.759 296.803-362.062z"
                            opacity="1"
                            data-original="#00cc76"
                        ></path>
                        <path
                            className='fill-primary'
                            d="m461.022 111.234-14.112 5.649c-34.771 13.919-70.217 25.975-106.117 36.56v.001c-21.412 6.314-42.985 12.104-64.674 17.454-93.258 23.005-162.413 107.214-162.413 207.575V512c.001 0 242.122-152.806 347.316-400.766z"
                            opacity="1"
                            data-original="#a5e887"
                        ></path>
                    </g>
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    version="1.1"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="32"
                    height="32"
                    viewBox="0 0 512 512"
                    xmlSpace="preserve"
                    className='absolute blur opacity-50'
                >
                    <g>
                        <path
                            className='fill-primary/50'
                            d="M113.707 512 55.575 391.792c-43.694-90.351-18.098-196.268 55.842-257.579 46.027-38.166 89.94-78.812 130.239-122.984L251.9 0l23.821 31.473c29.393 38.834 51.822 80.128 65.073 121.97z"
                            opacity="1"
                        ></path>
                        <path
                            className='fill-primary/60'
                            d="m468.766 149.938-7.743-38.704c-38.269 90.207-136.426 138.139-192.689 200.383C169.942 420.469 113.707 512 113.707 512h58.256c258.928 0 334.274-174.759 296.803-362.062z"
                            opacity="1"
                            data-original="#00cc76"
                        ></path>
                        <path
                            className='fill-primary'
                            d="m461.022 111.234-14.112 5.649c-34.771 13.919-70.217 25.975-106.117 36.56v.001c-21.412 6.314-42.985 12.104-64.674 17.454-93.258 23.005-162.413 107.214-162.413 207.575V512c.001 0 242.122-152.806 347.316-400.766z"
                            opacity="1"
                            data-original="#a5e887"
                        ></path>
                    </g>
                </svg>
            </div>
        </div>
    )
}
