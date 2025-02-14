interface ValidateStatus {
    /**
     * a function that takes a numeric status code and returns a boolean indicating whether the status is valid. If the status is not valid, the result will be failed. then call `onResponseStatusError` lifecycle method
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