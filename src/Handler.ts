import { Data, DateTime, Effect } from "effect";
import type { Request, Response } from "express";
import { Describer } from "./Transaction/Describer";
import { Logger } from "./Service/Logger";

export class HandlerError extends Data.TaggedError("HandlerError")<{
  readonly status_code?: number,
  readonly error?: string,
  readonly message?: string,
}> {}

export const Handler = {
  getDescriberStats:
    (req: Request, rsp: Response) =>
      Effect.gen(function* () {
        const stats =
          yield* Describer.getStats();
        rsp.json(stats);
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const exception = JSON.stringify(cause);
              const { failure } = JSON.parse(exception);
              const error = failure ?? cause;

              yield* _respondError(req, rsp, error);

              return yield* Effect.fail(
                new HandlerError({ ...error })
              );
            })
        )
      ),

  describeAddressTransactions:
    (req: Request, rsp: Response) =>
      Effect.gen(function* () {
        const { ip } = req;
        if (!ip) return yield* Effect.fail(
          new HandlerError({
            status_code: 403,
            error: "Unidentifiable Requester",
            message: "Undefined Requester IP Address",
          })
        );

        const reqTime = yield* DateTime.now;

        const count = parseInt(`${req.query.count ?? 5}`);
        if (count < 1) return yield* Effect.fail(
          new HandlerError({
            status_code: 400,
            error: "Bad Request",
            message: "Minimum count is 1 transaction per request.",
          })
        );
        if (count > 10) return yield* Effect.fail(
          new HandlerError({
            status_code: 400,
            error: "Bad Request",
            message: "Maximum count is 10 transactions per request.",
          })
        );

        const descriptions =
          yield* Describer.describeAddressTransactions(
            req.params.address,
            count,
          );
        rsp.json(descriptions);

        const rspTime = yield* DateTime.now;

        _log(ip, // client identifier
          { path: req.path, time: reqTime.epochMillis }, // request path and time MS
          { body: JSON.stringify(descriptions), time: rspTime.epochMillis }, // resp
          { uuid: descriptions.id, time: rspTime.epochMillis - reqTime.epochMillis },
        );
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const exception = JSON.stringify(cause);
              const { failure } = JSON.parse(exception);
              const error = failure ?? cause;

              yield* _respondError(req, rsp, error);

              return yield* Effect.fail(
                new HandlerError({ ...error })
              );
            })
        )
      ),

  describeSpecificAddressTransaction:
    (req: Request, rsp: Response) =>
      Effect.gen(function* () {
        const { ip } = req;
        if (!ip) return yield* Effect.fail(
          new HandlerError({
            status_code: 403,
            error: "Unidentifiable Requester",
            message: "Undefined Requester IP Address",
          })
        );

        const reqTime = yield* DateTime.now;

        const descriptions =
          yield* Describer.describeSpecificAddressTransaction(
            req.params.address,
            req.params.hash,
          );
        rsp.json(descriptions);

        const rspTime = yield* DateTime.now;

        _log(ip, // client identifier
          { path: req.path, time: reqTime.epochMillis }, // request path and time MS
          { body: JSON.stringify(descriptions), time: rspTime.epochMillis }, // resp
          { uuid: descriptions.id, time: rspTime.epochMillis - reqTime.epochMillis },
        );
      }).pipe(
        Effect.catchAllCause(
          (cause) =>
            Effect.gen(function* () {
              const exception = JSON.stringify(cause);
              const { failure } = JSON.parse(exception);
              const error = failure ?? cause;

              yield* _respondError(req, rsp, error);

              return yield* Effect.fail(
                new HandlerError({ ...error })
              );
            })
        )
      ),
};

const _log = (
  client: string,
  request: { path: string, time: number; },
  response: { body: string, time: number; },
  process: { uuid: string, time: number; },
) => Effect.succeed(
  Logger.log.info({ client, request, response, process })
);

const _logError = (
  client: string | undefined,
  path: string,
  time: number,
  error: any,
) => Effect.succeed(
  Logger.log.error({ client, path, time, error })
);

const _respondError = (
  request: Request,
  response: Response,
  error: any,
  status: number = 500,
) => Effect.gen(function* () {
  const { ip, path } = request;
  const { epochMillis } = yield* DateTime.now;

  response
    .status(error.status_code ?? status)
    .json({ error: error.message ?? error });

  _logError(ip, path, epochMillis, error);
});
