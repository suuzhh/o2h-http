export { safeAssignment } from "./safeAssignmentOperator";

/** Promise结果包装类 */
export type IResult<T = object, E = Error> =
  | { error: E; data?: undefined; response?: Response }
  | { data: T; error?: undefined; response: Response };

/** 构建成功结果 */
export function buildSuccessResult<RESULT>(
  data: RESULT,
  response: Response
): IResult<RESULT> {
  return { data, response };
}

/** 构建失败结果 */
export function buildFailResult(
  nativeError: Error,
  response?: Response
): IResult<never> {
  // console.error(nativeError);
  return { error: nativeError, response };
}
