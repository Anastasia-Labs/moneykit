import * as winston from "winston";

export const Logger = {
  log: winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.prettyPrint({
        colorize: true,
      }),
      winston.format.colorize({
        all: true,
        colors: {
          info: "blue",
          warn: "yellow",
          error: "red",
        },
      }),
    ),
    transports: new winston.transports.Console(),
  })
};
