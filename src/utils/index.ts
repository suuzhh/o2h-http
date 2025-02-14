export { safeAssignment } from "./safeAssignmentOperator";

/** Promise结果包装类 */
export type IResult<T = object, E = Error> =
  | { error: E; data?: undefined }
  | { data: T; error?: undefined };

/** 构建成功结果 */
export function buildSuccessResult<RESULT>(data: RESULT): IResult<RESULT> {
  return { data };
}

/** 构建失败结果 */
export function buildFailResult(nativeError: Error): IResult<never> {
  // console.error(nativeError);
  return { error: nativeError };
}
