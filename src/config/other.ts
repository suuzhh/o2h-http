interface ValidateStatus {
    /**
     * `validateStatus` defines whether to resolve or reject the promise for a given
     *  HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
     *  or `undefined`), the promise will be resolved; otherwise, the promise will be
     *  rejected.
     * @param status HTTP status code
     * @returns
     */
    validateStatus: (status: number) => boolean;

    /**
     * 请求超时时间
     * 
     * 0 表示不限制 使用系统默认超时时间
     */
    timeout: number;
}

export function getDefultOtherConfig() {
    return {
        timeout: 0,
        validateStatus: (status: number) => status >= 200 && status < 300,
    };
}

/** 其它请求配置 */
export interface OtherConfig extends ValidateStatus {}