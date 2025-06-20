import type { Request, Response } from "express";

import { Effect } from "effect";
import { NodeContext } from "@effect/platform-node";

import { Describer, DescriberLayerLive, DistinctCategoriesLive, DistinctProjectsLive } from "./Transaction/Describer";

import { CacheLive } from "./Service/Cache";
import { Logger } from "./Service/Logger";

export async function getDescriberStats(req: Request, rsp: Response) {
  try {
    const stats =
      await Effect.runPromise(
        Describer.getStats()
          .pipe(
            Effect.provide(DescriberLayerLive),
            Effect.provide(DistinctProjectsLive),
            Effect.provide(DistinctCategoriesLive),
            Effect.provide(NodeContext.layer),
          )
      );
    rsp.json(stats);
  } catch (exception) {
    const error = JSON.stringify(exception);
    const failure = JSON.parse(error).cause?.failure;
    _respondError(req, rsp, failure ?? exception);
  }
}

export async function describeAddressTransactions(req: Request, rsp: Response) {
  try {
    const { ip } = req;
    if (!ip) throw {
      status_code: 403,
      message: "Unidentifiable Requester",
    };

    const reqTime = new Date().getTime();

    const count = parseInt(`${req.query.count ?? 5}`);
    if (count < 1) throw {
      status_code: 400,
      message: "Minimum count is 1 transaction per request.",
    };
    if (count > 10) throw {
      status_code: 400,
      message: "Maximum count is 10 transactions per request.",
    };

    const descriptions =
      await Effect.runPromise(
        Describer.describeAddressTransactions(
          req.params.address,
          count,
        ).pipe(
          Effect.provide(DescriberLayerLive),
          Effect.provide(DistinctProjectsLive),
          Effect.provide(DistinctCategoriesLive),
          // Effect.provide(BfApiLive),
          Effect.provide(CacheLive),
          Effect.provide(NodeContext.layer),
        )
      );
    rsp.json(descriptions);

    const rspTime = new Date().getTime();

    _log(ip, // client identifier
      { path: req.path, time: reqTime }, // req path and time
      { body: JSON.stringify(descriptions), time: rspTime }, // resp body and time
      { uuid: descriptions.id, time: rspTime - reqTime }, // proc uuid and duration
    );
  } catch (exception) {
    const error = JSON.stringify(exception);
    const failure = JSON.parse(error).cause?.failure;
    _respondError(req, rsp, failure ?? exception);
  }
};

export async function describeSpecificAddressTransaction(req: Request, rsp: Response) {
  try {
    const { ip } = req;
    if (!ip) throw {
      status_code: 403,
      message: "Unidentifiable Requester",
    };

    const reqTime = new Date().getTime();

    const description =
      await Effect.runPromise(
        Describer.describeSpecificAddressTransaction(
          req.params.address,
          req.params.hash,
        ).pipe(
          Effect.provide(DescriberLayerLive),
          Effect.provide(DistinctProjectsLive),
          Effect.provide(DistinctCategoriesLive),
          // Effect.provide(BfApiLive),
          Effect.provide(CacheLive),
          Effect.provide(NodeContext.layer),
        )
      );
    rsp.json(description);

    const rspTime = new Date().getTime();

    _log(ip, // client identifier
      { path: req.path, time: reqTime }, // req path and time
      { body: JSON.stringify(description), time: rspTime }, // resp body and time
      { uuid: description.id, time: rspTime - reqTime }, // proc uuid and duration
    );
  } catch (exception) {
    const error = JSON.stringify(exception);
    const failure = JSON.parse(error).cause?.failure;
    _respondError(req, rsp, failure ?? exception);
  }
};

function _log(
  client: string,
  request: { path: string, time: number; },
  response: { body: string, time: number; },
  process: { uuid: string, time: number; },
) {
  Logger.log.info({ client, request, response, process });
}

function _logError(
  client: string | undefined,
  path: string,
  time: number,
  error: any,
) {
  Logger.log.error({ client, path, time, error });
}

function _respondError(
  request: Request,
  response: Response,
  error: any,
  status: number = 500,
) {
  const { ip, path } = request;
  const time = new Date().getTime();

  response
    .status(error.status_code ?? status)
    .json({ error: error.message ?? error });

  _logError(ip, path, time, error);
};
